
var config = require("./../config");
var responseGenerator = require("./responseGenerator");
var errorMsg = require("./errorMessages");
var jwt = require("jsonwebtoken");

exports.verifyRequest = function(req, res, next) {
    var token = req.headers.auth;
    if(token) {
        jwt.verify(token, config.privateKey, function(err, result) {
            if(err) {
                res.send(responseGenerator.getResponse(501, errorMsg.tokenInvalid, []))
            }
            else {
                res.locals.result = result;
                next();
            }
        });
    }
    else {
        res.send(responseGenerator.getResponse(501, errorMsg.tokenInvalid, []))
    }
};

