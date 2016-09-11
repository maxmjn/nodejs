/**
 * Created by maxmjn20 on 9/10/16.
 */

var service = {};

service.makeErrorMsg = makeErrorMsg;

module.exports = service;

function makeErrorMsg(errorCode, error) {
    return {
        "errorCode" : errorCode,
        "errormsg" : error
    };
}