var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var _ = require('lodash');
var empty = require('is-empty');

//Constants
const SFDC_AUTHCODE_URL = config.sfdcAuthCodeUrl + config.sfdcAuthResponseType + '&' + config.sfdcConsumerKey
    + '&' + encodeURI(config.sfdcRedirectUrl);

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);

module.exports = router;

//Helper methods
/* none */

//Controllers
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

/**
 * Get current user
 * If SFDC oauth info missing, send request URL to user
 * @param req
 * @param res
 */
function getCurrentUser(req, res) {
    console.log('getCurrentUser:');

    userService.getById(req.user.sub) //sub is userID encoded into JWT in user.service.authenticate and decoded by express-jwt in server.js
        .then(function (user) {
            if (user) {
                var userJwt = req.session.token;

                console.log('user.username', user.username);
                // console.dir(user);
                console.log('user jwt:', userJwt);

                var sfdcOauth =_.get(user, 'sfdcOauthInfo', {});
                console.log('empty(sfdcOauth)', empty(sfdcOauth));

                if(empty(sfdcOauth)){ //empty sfdc oauth info
                  user.hasSfdcAccessToken = false; //used by angular to make SFDC oauth code request
                  user.sfdcAuthCodeUrl = SFDC_AUTHCODE_URL + '&state=' + userJwt; //userService.getUserJwt(req.user.sub); //sub is userID encoded into JWT in user.service.authenticate and decoded by express-jwt in server.js, SFDC returns state value along with oauth code.
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
