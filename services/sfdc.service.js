var config = require('config.json');
var _ = require('lodash');
var empty = require('is-empty');
var request = require('request');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');

var userService = require('services/user.service');

//CONSTANTS
const ACCESS_TOKEN_URL = config.sfdcAccessTokenUrl;
const REFRESHTOKEN_PAYLOAD = config.sfdcRefreshTokenGrantType + '&' + config.sfdcConsumerKey + '&' + config.sfdcConsumerSecret + config.sfdcRefreshToken;
var ACCESSTOKEN_PAYLOAD = config.sfdcAccessTokenGrantType + '&' + config.sfdcConsumerKey + '&' + config.sfdcConsumerSecret
                        + '&' + encodeURI(config.sfdcRedirectUrl);

//Search params
const parameterizedAccountSearch = '/services/data/v37.0/parameterizedSearch/?sobject=Account&Account.fields=id,name&Account.limit=10&q='

var service = {};

service.getAccessToken = getAccessToken;
service.query = query;

module.exports = service;

// Helper methods
function pluckInstanceUrl(oauthInfo) {
  var url = _.get(oauthInfo,'instance_url','SFDC_INSTANCE_URL');
  console.log('instance_url', url);
  return url;
}

function pluckAccessToken(oauthInfo) {
  var access_token = _.get(oauthInfo, 'access_token','SFDC_ACCESS_TOKEN');
  console.log('access_token', access_token);
  return access_token;
}

function pluckRefreshToken(oauthInfo) {
    var refresh_token = _.get(oauthInfo, 'refresh_token','SFDC_REFRESH_TOKEN');
    console.log('refresh_token', refresh_token);
    return refresh_token;
}

function makeErrorMsg(error) {
  return {
        "errorCode" : "SFDC_ERROR",
        "errormsg" : error
    };
}

// Service methods
/**
 * userId is required to update User if refresh token is used to get new access token
 *
 * @param userId
 * @param oauthInfo
 * @param query
 * @returns {*|promise}
 */
function query(userId, oauthInfo, query) {

    var deferred = Q.defer();

    console.log('query:', 'userId', userId, 'query', query, 'oauthInfo.access_token', oauthInfo.access_token);

    var thisMethod = this;
    var url = pluckInstanceUrl(oauthInfo) + parameterizedAccountSearch + query;
    var accessToken = pluckAccessToken(oauthInfo);
    var refreshToken = pluckRefreshToken(oauthInfo);
    console.log('url', url, 'access_token', accessToken);

    //Make SFDC query
    request.get({
        url: url,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + accessToken
        }
    }, function (error, response, body) {

          console.log('SFDC search response:', response.statusCode);
          var jsonResponse = JSON.parse(body);

          if (error) {
              console.log(error);
              deferred.resolve(makeErrorMsg(error));
          } else if (response.statusCode == 200) {
              deferred.resolve(jsonResponse);
          } else if(response.statusCode == 401){ // bad access token
              getAccessToken(userId, '', refreshToken)
                  .then(function (newOauthInfo) {

                      console.log('getAccessToken response newOauthInfo:', newOauthInfo);
                      thisMethod(userId, newOauthInfo, query);
                  })
                  .catch(function (err) {
                      console.log('After calling getAccessToken', err);
                      deferred.resolve(makeErrorMsg(err));
                  });
          } else {
              deferred.resolve(makeErrorMsg(jsonResponse));
          }
    });

    return deferred.promise;
}

/**
 * Get access token using either OAuthCode or Refresh token
 * Update User with OAuthInfo
 * @param userId
 * @param oauthCode
 * @param refresh_token
 * @returns {*|promise}
 */
function getAccessToken(userId, oauthCode, refresh_token){
    var deferred = Q.defer();

    console.log('getAccessToken:');

    // Construct SFDC access token payload
    var payload ='';
    if(!empty(refresh_token)) {
        payload = REFRESHTOKEN_PAYLOAD + refresh_token;
    }
    if(!empty(oauthCode)) {
        payload = ACCESSTOKEN_PAYLOAD + '&code=' + oauthCode;
    }

    console.log('url', ACCESS_TOKEN_URL, 'payload', payload);

    // Make SFDC call to get access token
    request.post({
        url: ACCESS_TOKEN_URL,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload
    }, function (error, response, body) {

        console.log('SFDC token response:', response.statusCode);

        if (error) {
            console.log(error);
            deferred.resolve({"errormsg": "Error getting access_token using refresh_token"});
        } else if (response.statusCode == 200) {

            // console.log(body);
            var oauthinfo = JSON.parse(body);

            //update user with response
            userService.updateUserOauthInfo(userId, oauthinfo);

            deferred.resolve(oauthinfo);
        } else {
            var errormsg = JSON.parse(body);
            deferred.resolve(errormsg);
        }
    });

    return deferred.promise;
}
