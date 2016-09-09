var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var sfdcService = require('services/sfdc.service');
var _ = require('lodash');
var empty = require('is-empty');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);
router.get('/sfdc/oauth2',sfdcProcessOAuthCode);
router.get('/sfdc',sfdcSearch);

module.exports = router;

const sfdcAccessTokenUrl = config.sfdcAccessTokenUrl;
const sfdcAuthCodeUrl = config.sfdcAuthCodeUrl + config.sfdcAuthResponseType + '&' + config.sfdcConsumerKey + '&' + encodeURI(config.sfdcRedirectUrl);
var request = require('request');
var jwt = require('jsonwebtoken'); //decode JWT
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');

function sfdcSearch(req, res){
  var searchString = req.query.search;
  console.log('In sfdcSearch: query=',searchString);
  searchString = 'gene'; //For debug
  // Get user
  // Get access token
  var _id = req.user.sub;
  userService.getById(_id) //get user sfdcOauthInfo
      .then(function (user) {
          if (user && user.sfdcOauthInfo) {
              var parameterizedSearch =  '/services/data/v37.0/parameterizedSearch/?sobject=Account&Account.fields=id,name&Account.limit=10&q=' + searchString;
              request.get({
                  url: user.sfdcOauthInfo.instance_url + parameterizedSearch,
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded'
                  }
              }, function (error, response, body) {
                    console.log('SFDC search response:');
                    if (error) {
                        console.log(error);
                        // also get new access_token if expired
                        sfdcService.retryAccessToken(_id, user.sfdcOauthInfo, user.sfdcOauthInfo.instance_url + parameterizedSearch)
                        .then(function (searchResponse) {
                            res.sendStatus(searchResponse);
                        })
                        .catch(function (err) {
                            res.status(400).send(err);
                        });
                    }else{
                      console.dir(body);
                      res.send(body);
                    }
              });
          } else {
              res.sendStatus(200); //TODO: send errormsg = user oauthinfo missing
          }
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

/**
  sfdcProcessOAuthCode does the following
  - get oauth code and state(JWT assigned to user)
  - use oauth code to construct SFDC call for access token
  - use state to decode and get JWT payload
  - Make SFDC access token call, get access token
  - save access token into User object
*/
function sfdcProcessOAuthCode(req, res) {
  var oauthCode = req.query.code;
  var userJwt = req.query.state; //same as "state" param passed during SFDC AuthCode call, this is also same as req.session.token

  console.log('SFDC returned oauthCode:', oauthCode);
  console.log('SFDC returned state:', userJwt);
  if(oauthCode && userJwt){

      // redirect user - TODO: if required redirect user to another location
      res.redirect('/');

      // decode JWT to get userId to update user as SFDC callback will not have JWT in HTTP headers
      var decodedJwt = jwt.decode(userJwt, {complete:true}); //{complete:true} can be omitted to get only payload
      var _id = decodedJwt.payload.sub; //this is set in user.service.authenticate using getUserJwt
      console.log('decodedJwt:');
      console.dir(decodedJwt);
      console.log('decodedJwt parts:', decodedJwt.payload.sub);

      // Construct SFDC access token payload
      var data = 'code=' + oauthCode + '&' + config.sfdcAccessTokenGrantType + '&' + config.sfdcConsumerKey + '&' + config.sfdcConsumerSecret + '&' + encodeURI(config.sfdcRedirectUrl);
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
            }else{
              console.log('SFDC access token response:');
              console.dir(body);
              //update user with response
              var set = {
                sfdcOauthInfo: body
              };
              db.users.update(
                  { _id: mongo.helper.toObjectID(_id) },
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
            }
      });
  }
}

function authenticateUser(req, res) {
    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                res.send({ token: token });
            } else {
                // authentication failed
                res.status(401).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    userService.getById(req.user.sub) //sub is userID encoded into JWT in user.service.authenticate and decoded by express-jwt in server.js
        .then(function (user) {
            if (user) {
                var userJwt = req.session.token;

                console.log('user:');
                console.dir(user);
                console.log('user jwt:', userJwt);

                var sfdcOauth =_.get(user, 'sfdcOauthInfo', {});
                console.log('sfdcOauth:', sfdcOauth);

                if(empty(sfdcOauth)){ //empty sfdc oauth info
                  user.hasSfdcAccessToken = false; //used by angular to make SFDC oauth code request
                  user.sfdcAuthCodeUrl = sfdcAuthCodeUrl + '&state=' + userJwt; //userService.getUserJwt(req.user.sub); //sub is userID encoded into JWT in user.service.authenticate and decoded by express-jwt in server.js, SFDC returns state value along with oauth code.
                  console.log('sfdcAuthCodeUrl:',user.sfdcAuthCodeUrl);
                }

                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only update own account
        return res.status(401).send('You can only update your own account');
    }

    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
