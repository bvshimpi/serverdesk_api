var mysql = require('mysql');
var config = require('../config.js');

var connection = mysql.createConnection({
    host: config.databaseHost,
    user: config.databaseUser,
    password: config.databasePassword,
    database: config.databaseDatabaseName,
    multipleStatements: true
});


connection.connect(function(err) {
    if(err) {
        console.log("Error in Connecting DB", err);
    }
    else {
        console.log("Connection established.");
    }
});

module.exports = connection;
