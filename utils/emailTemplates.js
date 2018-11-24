var path = require('path');
var fs = require('fs');
var config = require(path.resolve('./', 'config'))


exports.welcome = function(username,token,callback){
    link = config.frontEndHost + "/#/Cryptoriyal/activate/" + token;
 var template = fs.readFileSync('./static/welcome.html','utf8').toString();
     template = template.replace("$username",username).replace("$link",link)
     callback(null,template)
}

exports.forgot=function(username,token,callback){
    link=config.frontEndHost + "/#/Cryptoriyal/resetPassword/"+ token;
    
  var template = fs.readFileSync('./static/reset.html','utf8').toString();
     template = template.replace("$username",username).replace("$link",link)
   callback(null,template)
}

exports.ticket=function(ticketNumber,token,callback){
    
     var template = fs.readFileSync('./static/ticket.html','utf8').toString();
     template = template.replace("$ticket",ticketNumber)
   callback(null,template)
}

exports.requestResetToAdmin=function(password,callback){

    
     var template = fs.readFileSync('./static/resetAdmin.html','utf8').toString();
     template = template.replace("$password",password)
   callback(null,template)
}
