const mysql = require("mysql2");
require('dotenv').config();

exports.dbConnect = function() {
    return mysql.createConnection({
        host: process.env.HOST_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_NAME
    });
}