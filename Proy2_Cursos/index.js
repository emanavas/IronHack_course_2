// /workspaces/IronHack_course_2/Proy1/index.js

//ejs https://github.com/mde/ejs/wiki/Using-EJS-with-Express

const {app, router} = require("#config/main_config.js")
const {mw_check_session} = require("#root/config/middleware.js")

//init database
const db = require("#root/config/db.js")


app.use(mw_check_session)


//setting routers
app.use("/", require('./routers/rts_login.js'));
app.use('/courses/', require('./routers/rts_courses.js'));
//app.use('/users/', require('./routers/rts_users.js'));

module.exports = app;
