var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var sfdcService = require('services/sfdc.service');
var errorService = require('services/error.service');
var empty = require('is-empty');

var request = require('request');
var jwt = require('jsonwebtoken'); //decode JWT
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');


const SFDC_CNTRL = 'SFDC_CNTRL';

// routes
router.get('/oauth2',processOAuthCode);
router.get('/search',search);
router.get('/test', test);

module.exports = router;

//Helper
/** none **/
function test(req, res) {
    console.log('test:', 'req.search', req.search, 'req.query', req.query);
    var s2 = [{"name":"Virginia", "sym":"VA"},
        {"name":"Washington", "sym":"WA"}
    ];
    res.send(s2);
}

//Controllers
function search(req, res){

    console.log('In sfdcSearch:');

    var searchQuery = req.query.search;
    console.log('query=',searchQuery);
    searchQuery = 'gene'; //For debug

    // Get user
    var _id = req.user.sub;
    console.log('_id:', _id);

    //get user SFDC OauthInfo
    userService.getById(_id)
        .then(function (user) {
            if(user) {
                var sfdcOauthInfo = userService.getUserOauthInfo(user);

                if(!empty(sfdcOauthInfo)) {
                    sfdcService.query(_id, sfdcOauthInfo, searchQuery)
                        .then(function (searchResult) {
                            res.send(searchResult);
                        })
                        .catch(function (err) {
                            res.status(400).send(errorService.makeErrorMsg(SFDC_CNTRL, err));
                        });
                } else {
                    res.status(200).send(errorService.makeErrorMsg(SFDC_CNTRL,"User SFDC OauthInfo Not found!"));
                }
            } else {
                res.status(200).send(errorService.makeErrorMsg(SFDC_CNTRL,"User Not found!"));
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

/**
  processOAuthCode does the following
  - get oauth code and state(JWT assigned to user)
  - use oauth code to construct SFDC call for access token
  - use state to decode and get JWT payload
  - Make SFDC access token call, get access token
  - save access token into User object
*/
function processOAuthCode(req, res) {

    console.log('processOAuthCode');

    var oauthCode = req.query.code;
    var userJwt = req.query.state; //same as "state" param passed during SFDC AuthCode call, This is the JWT saved as req.session.token in login.controller.js
    console.log('SFDC returned oauthCode:', oauthCode);
    console.log('SFDC returned state:', userJwt);

    if (oauthCode && userJwt) {

        // redirect user - TODO: if required redirect user to another location
        res.redirect('/');

        // decode JWT to get userId to update user as SFDC callback will not have JWT in HTTP headers
        var decodedJwt = jwt.decode(userJwt, {complete: true}); //{complete:true} can be omitted to get only payload
        var _id = decodedJwt.payload.sub; //this is set in user.service.authenticate using getUserJwt
        console.log('decodedJwt:');
        // console.dir(decodedJwt);
        console.log('decodedJwt payload.sub:', decodedJwt.payload.sub);

        sfdcService.getAccessToken(_id, oauthCode, '')

    }
}
