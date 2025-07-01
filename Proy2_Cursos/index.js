// /workspaces/IronHack_course_2/Proy1/index.js

//ejs https://github.com/mde/ejs/wiki/Using-EJS-with-Express

const config = require("#config/main_config.js")
const {mw_check_session} = require("#root/config/middleware.js")
//init database
const db = require("#root/config/db.js")

const port = 3000;


config.app.use(mw_check_session)

//setting routers
config.app.use("/", config.router);
config.app.use('/cursos/', require('./routers/rts_cursos.js'));
config.app.use('/users/', require('./routers/rts_users.js'));



config.app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
