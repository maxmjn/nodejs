// var querystring = require('querystring');
// var https = require('https');
//
// var host = 'randomuser.me';
//
// var service = {};
//
// service.performRequest = performRequest;
//
// module.exports = service;
//
// function performRequest(endpoint, method, data, success) {
//   var dataString = JSON.stringify(data);
//   var headers = {};
//
//   if (method == 'GET') {
//     endpoint += '?' + querystring.stringify(data);
//   }
//   else {
//     headers = {
//       'Content-Type': 'application/json',
//       'Content-Length': dataString.length
//     };
//   }
//   var options = {
//     host: host,
//     path: endpoint,
//     method: method,
//     headers: headers
//   };
//
//   var req = https.request(options, function(res) {
//     res.setEncoding('utf-8');
//
//     var responseString = '';
//
//     res.on('data', function(data) {
//       responseString += data;
//     });
//
//     res.on('end', function() {
//       console.log(responseString);
//       var responseObject = JSON.parse(responseString);
//       success(responseObject);
//     });
//   });
//
//   req.write(dataString);
//   req.end();
// }
// function handleSuccess(responseObject) {
//   console.log('handleSuccess:', responseObject);
// }
// performRequest('/api','GET','','');

// Using request
// var request = require('request');
// Generic request method
// request({
//     url: 'https://login.salesforce.com/services/oauth2/token', //URL to hit
//     method: 'POST',
//     //Lets post the following key/values as form
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     body: 'grant_type=refresh_token&client_id=3MVG9iTxZANhwHQvPs.3TAJ48OLuizmv4WrYhk1SCLcBbiD.2DwSJzjUXiA2NFL_UNi086JfafFxyNeGqGklf&client_secret=4868649746186949863&refresh_token=5Aep861MbVwdPc2TIimFAwkeJCs99vww9V67kwF.ZiWXdfFrUhclzUGt8nUA1CLbQVm6Xi7aIob7vOQoCcRykID'
// }, function(error, response, body){
//     if(error) {
//         console.log(error);
//     } else {
//         console.log('SFDC access token response:');
//         console.dir(body);
//     }
// });

//request.GET method
// request.get({
//     url: 'https://randomuser.me/api/',
//     form: '',
//     json: true
// }, function (error, response, body) {
//     if (error) {
//         console.log(error);
//     }else{
//       // console.log(response);
//       console.log(body);
//     }
// });
// SFDC access token request using refresh_token
// request.POST method
// request.post({
//     url: 'https://login.salesforce.com/services/oauth2/token', //URL to hit
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     body: 'grant_type=refresh_token&client_id=3MVG9iTxZANhwHQvPs.3TAJ48OLuizmv4WrYhk1SCLcBbiD.2DwSJzjUXiA2NFL_UNi086JfafFxyNeGqGklf&client_secret=4868649746186949863&refresh_token=5Aep861MbVwdPc2TIimFAwkeJCs99vww9V67kwF.ZiWXdfFrUhclzUGt8nUA1CLbQVm6Xi7aIob7vOQoCcRykID'
// }, function (error, response, body) {
//       if (error) {
//           console.log(error);
//       }else{
//         console.log('SFDC access token response:');
//         console.dir(body);
//       }
// });

// SFDC Account
// request.get({
//     url: 'https://na2.salesforce.com/services/data/v37.0/sobjects/Account/0014000000HySURAA3 ',
//     headers: {
//         'Authorization': 'Bearer 00D4000000098qV!AR0AQBV3k4qvF2BoOgHrssWEMZMB1NEgX.6UgyDtJ3S62WHWUcxdVMGLRNUeKjq_iCCYFKXAA1gQyVJw2TO9PBZQJJZTjw3v'
//     },
//     json: true
// }, function (error, response, body) {
//     if (error) {
//         console.log(error);
//     }else{
//       // console.log(response);
//       console.log(body);
//     }
// });

// SFDC curl TESTs
// SFDC GET
// curl https://na2.salesforce.com/services/data/v37.0/sobjects/Account/0014000000HySURAA3 -H 'Authorization: Bearer 00D4000000098qV!AR0AQBV3k4qvF2BoOgHrssWEMZMB1NEgX.6UgyDtJ3S62WHWUcxdVMGLRNUeKjq_iCCYFKXAA1gQyVJw2TO9PBZQJJZTjw3v' -H "X-PrettyPrint:1"
//
// SFDC SOQL
// curl https://na2.salesforce.com/services/data/v37.0/query?q=select+name+from+Account+where+name+like+%27%25gene%25%27 -H 'Authorization: Bearer 00D4000000098qV!AR0AQBV3k4qvF2BoOgHrssWEMZMB1NEgX.6UgyDtJ3S62WHWUcxdVMGLRNUeKjq_iCCYFKXAA1gQyVJw2TO9PBZQJJZTjw3v' -H "X-PrettyPrint:1"
//
// SFDC SOQL
// Use query?explain=SOQL to get sobjects cardinality, query cost,...
// - "relativeCost" <= 1.0 indicates SOQL query is selective (better performing)
//     curl https://na2.salesforce.com/services/data/v37.0/query?explain=SELECT+name+from+Account -H 'Authorization: Bearer 00D4000000098qV!AR0AQBV3k4qvF2BoOgHrssWEMZMB1NEgX.6UgyDtJ3S62WHWUcxdVMGLRNUeKjq_iCCYFKXAA1gQyVJw2TO9PBZQJJZTjw3v' -H "X-PrettyPrint:1"
//
// SFDC SOQL
//     curl https://na2.salesforce.com/services/data/v37.0/query?explain=select+name+from+Account+where+name+like+%27%25gene%25%27 -H 'Authorization: Bearer 00D4000000098qV!AR0AQBV3k4qvF2BoOgHrssWEMZMB1NEgX.6UgyDtJ3S62WHWUcxdVMGLRNUeKjq_iCCYFKXAA1gQyVJw2TO9PBZQJJZTjw3v' -H "X-PrettyPrint:1"
//
// SFDC Update
// curl https://na2.salesforce.com/services/data/v20.0/sobjects/Account/0014000000HySURAA3 -H 'Authorization: Bearer 00D4000000098qV!AR0AQBV3k4qvF2BoOgHrssWEMZMB1NEgX.6UgyDtJ3S62WHWUcxdVMGLRNUeKjq_iCCYFKXAA1gQyVJw2TO9PBZQJJZTjw3v' -H "X-PrettyPrint:1" -H "Content-Type: application/json" --data-binary @patchaccount.json -X PATCH


// var config = require('./config.json');
// var sfdcAuthCodeUrl = config.sfdcAuthCodeUrl + config.sfdcAuthResponseType + '&' + config.sfdcConsumerKey + '&' + encodeURI(config.sfdcRedirectUrl);
// console.log('sfdcAuthCodeURL:',sfdcAuthCodeUrl);
//
// var sfdcAccessTokenParams = config.sfdcAccessTokenUrl + config.sfdcAccessTokenGrantType + '&' + config.sfdcConsumerKey + '&' + config.sfdcConsumerSecret + '&' + encodeURIComponent(config.sfdcRedirectUrl);
// console.log('sfdcAccessTokenParams:',sfdcAccessTokenParams);


var jwt = require('jsonwebtoken');
var decodedJwt = jwt.decode('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1N2NjMTdjOWI5YmM2OWI3Yzk4ZWJiMGUiLCJpYXQiOjE0NzMxMTYxNjB9._xCnzVlnuIh6RG6JiUUwG_Ti2UeXgIu2SWbkjx8hqkk', {complete:true});
console.log('decodedJwt:');
console.dir(decodedJwt);
console.log('decodedJwt parts:', decodedJwt.payload.sub);
