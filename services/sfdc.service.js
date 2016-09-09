var config = require('config.json');
var _ = require('lodash');
var request = require('request');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');

const sfdcAccessTokenUrl = config.sfdcAccessTokenUrl;
const sfdcAuthCodeUrl = config.sfdcAuthCodeUrl + config.sfdcAuthResponseType + '&' + config.sfdcConsumerKey + '&' + encodeURI(config.sfdcRedirectUrl);

var service = {};

service.retryAccessToken = retryAccessToken;

module.exports = service;

function retryAccessToken(userId,sfdcOauthInfo, parameterizedSearch){
    var deferred = Q.defer();

    // Construct SFDC access token payload
    var data = config.sfdcRefreshTokenGrantType + '&' + config.sfdcConsumerKey + '&' + config.sfdcConsumerSecret + '&' + config.sfdcRefreshToken + sfdcOauthInfo.refresh_token;
    // Make SFDC call to get access token
    request.post({
        url: sfdcAccessTokenUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    }, function (error, response, body) {
          if (error) {
              console.log(error);
              deferred.resolve({"errormsg":"Error getting access_token using refresh_token"});
          }else{
            console.log('SFDC access token response:');
            console.dir(body);
            //update user with response
            var set = {
              sfdcOauthInfo: body
            };
            db.users.update(
                { _id: mongo.helper.toObjectID(userId) },
                { $set: set },
                function (err, doc) {
                    if (err) {
                      console.log(err.name + ': ' + err.message);
                      // TODO: should we let user know?
                    }
                    else {
                      console.log('updated user sfdcOauthInfo');
                      // TODO: should we let user know?
                    }
                });
            retryQuery(body.access_token, searchString);
          }
    });

    function retryQuery(access_token, searchString){
        var parameterizedSearch = '/services/data/v37.0/parameterizedSearch/?q=gene&sobject=Account&Account.fields=id,name&Account.limit=10';
        request.get({
            url: parameterizedSearch,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + access_token
            }
        }, function (error, response, body) {
              console.log('SFDC retryQuery response:');
              if (error) {
                  console.log(error);
                  deferred.reject({"errormsg":error});
              }else{
                console.dir(body);
                deferred.resolve(body);
              }
        });
    }

    return deferred.promise;
}
