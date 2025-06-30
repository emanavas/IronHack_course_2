const sqlite3 = require('sqlite3');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, './../db/db_app1.db')); //more info https://www.luisllamas.es/en/how-to-use-sqlite-with-nodejs/

module.exports = db;
