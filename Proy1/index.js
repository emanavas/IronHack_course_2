// /workspaces/IronHack_course_2/Proy1/index.js

//ejs https://github.com/mde/ejs/wiki/Using-EJS-with-Express

const config = require("#config/main_config.js")
const {mw_check_session} = require("#root/config/middleware.js")
//init database
const db = require("#root/config/db.js")

const port = 3000;



config.router.get('/', (req, res) => {
  console.log("render basic")
  res.render('basic', {session:req?.session})
});

config.app.use(mw_check_session)

//setting routers
config.app.use("/", config.router);
config.app.use('/products/', require('./routers/products.js'));
config.app.use('/api/users/', require('./routers/api_users.js'));



config.app.listen(port, () => {
  console.log(`ToDo app listening at http://localhost:${port}`);
});
