var path = require("path");
var config = require("../../config");
var db = require("../dbConnector");
var errorMsg = require("../../utils/errorMessages");
var responseGenerator = require("../../utils/responseGenerator");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
var emailHandler = require("../../utils/emailHandler");

exports.login = function(req, res) {
    var email = typeof req.body.email != "undefined" ? req.body.email : "";
    var password = typeof req.body.password != "undefined" ? req.body.password : "";

    if(email != "" && password != ""){
        var qry = "SELECT * FROM users WHERE email = ?";
        db.query(qry, email, function(errQuery, resQuery) {
            if(errQuery) {
                res.send(responseGenerator.getResponse(500, errorMsg.invalidCredentials, []));
            }
            else {
                if(resQuery.length == 0) {
                    res.send(responseGenerator.getResponse(500, errorMsg.invalidCredentials, []));
                }
                else {
                    if(bcrypt.compareSync(password, resQuery[0].password)) {
                        if(resQuery[0].is_verified == '1') {
                            var data = {
                                "id": resQuery[0].id,
                                "email": resQuery[0].email
                            }
                            var token = jwt.sign(data, config.privateKey, {
                                expiresIn: 25700
                            });
    
                            data = {
                                "email" : resQuery[0].email,
                                "name" : resQuery[0].name,
                                "token" : token
                            }
                            res.send(responseGenerator.getResponse(200, "Logined Successfully.", data));
                        }
                        else {
                            res.send(responseGenerator.getResponse(500, "Your account is not verified yet.", []));
                        }
                    }
                    else {
                        res.send(responseGenerator.getResponse(500, errorMsg.invalidCredentials, []));
                    }
                }
            }
        });
    }
    else {
        res.status(200);
        res.send(responseGenerator.getResponse(500, errorMsg.fieldMissing, []));
    }
}

exports.signup = function(req, res) {
    var email = typeof req.body.email != "undefined" ? req.body.email : "";
    var password = typeof req.body.password != "undefined" ? req.body.password : "";
    var cpassword = typeof req.body.cpassword != "undefined" ? req.body.cpassword : "";
    var name = typeof req.body.name != "undefined" ? req.body.name : "";

    if(email != "" && password != "" && cpassword != "" && name != ""){
        if(password == cpassword) {
            accountCheck(email, function(err) {
                if(err != null) {
                    res.send(responseGenerator.getResponse(500, err, []));
                }
                else {
                    var hash = bcrypt.hashSync(password, salt);
                    var qry = "INSERT INTO users set name = ?, email = ?, password = ?; SELECT LAST_INSERT_ID() as uid";
                    var values = [name, email, hash];
                    db.query(qry, values, function(errQuery, resQuery) {
                        if(errQuery != null) {
                            res.send(responseGenerator.getResponse(500, "Failed to user register", []));
                        }
                        else {
                            var uid = resQuery[1][0].uid;
                            var data = {
                                "id": uid,
                                "email": email
                            }

                            var token = jwt.sign(data, config.privateKey, {
                                expiresIn: 3600
                            });

                            var html = "<h4>User registered successfully.</h4>";
                            html += "<p>Please Click on following link to activate your account</p>";
                            html += "<a target='_BLANK' href='"+config.frontEndHost+"/activateUser/"+token+"'>Click Here</a>";
                            emailHandler.sendEmail(email, "User Registeration", html, function(err, result) {
                                if(err != null) {
                                    res.send(responseGenerator.getResponse(201, "User registered successfully, But Failed to send Account verification link on your email", []));
                                }
                                else {
                                    res.send(responseGenerator.getResponse(200, "User registered successfully. Account verification link is sent on your email", resQuery[1]));
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            res.send(responseGenerator.getResponse(500, "Password is not matching", []));
        }
    }
    else {
        res.send(responseGenerator.getResponse(500, errorMsg.fieldMissing, []));
    }
}

exports.activateAccount = function(req, res) {
  
    var result = res.locals.result;
    if(result) {
        var id = result.id;
        var query = "UPDATE users SET is_verified = '1' WHERE id = ?";
        db.query(query, id, function(errQuery, resQuery) {
            if(errQuery) {
                res.send(responseGenerator.getResponse(500, "Failed to activate user account", []))
            }
            else {
                res.send(responseGenerator.getResponse(200, "Account is activated successfully.", []))
            }
        });  
    }  
    else {
        res.send(responseGenerator.getResponse(500, "Failed to activate user account", []))
    }
};

exports.getUsers = function(req, res) {
  
    var result = res.locals.result;
    if(result) {

        var query = "SELECT id,name,email FROM users";
        db.query(query, function(errQuery, resQuery) {
            if(errQuery) {
                res.send(responseGenerator.getResponse(500, "Failed to get users", []))
            }
            else {
                res.send(responseGenerator.getResponse(200, "Users found.", resQuery))
            }
        });  
    }  
    else {
        res.send(responseGenerator.getResponse(500, "Failed to get users", []))
    }
};

exports.isLogined = function(req, res) {

    var result = res.locals.result;
    if(result) {
        res.send(responseGenerator.getResponse(200, "Users is logined.", []));
    }  
    else {
        res.send(responseGenerator.getResponse(500, "User is not logined", []))
    }
};

function accountCheck(email, callback) {
    var qry = "SELECT id from users WHERE email = ?";
    db.query(qry, email, function(errQuery, resQuery) {
        if(errQuery) {
            callback("Failed to user register");
        }
        else {
            if(resQuery.length == 0)
                callback(null);
            else
                callback("User email already exists");
        }
    });
}

exports.testMail = function(req, res) {
    var html = "<h4>Hello, Welcome to Serverdesk</h4>";
    emailHandler.sendEmail("bvshimpi@gmail.com", "Welcome", html, function(err, result) {
        if(err != null) {
            res.send(responseGenerator.getResponse(201, "Failed to send email", []));
        }
        else {
            res.send(responseGenerator.getResponse(200, "Email send successfully.", []));
        }
    });
}