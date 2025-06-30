const express = require('express');
const session = require('express-session');
const path = require('path');


const app = express();
const router = express.Router({ mergeParams: true })


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
//use ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './../views'));
app.use(express.static(path.join(__dirname, './../public')));


//use session express
//app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
app.use(session({ secret: 'keyboard cat'}))

module.exports = {app, router, session};
