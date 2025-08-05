// /workspaces/IronHack_course_2/Proy1/index.js

//ejs https://github.com/mde/ejs/wiki/Using-EJS-with-Express

const {app, router} = require("#config/main_config.js")
const {mw_check_session} = require("#root/config/middleware.js")
const morgan = require('morgan');
const port = process.env.PORT || 3003;

//init database
const db = require("#root/config/db.js")


app.use(mw_check_session)


//setting routers
app.use(require('./routers/rts_login.js'));
app.use(require('./routers/rts_general.js'));
app.use(require('./routers/rts_admin'));
app.use(require('./routers/rts_restaurant.js'));
app.use(require('./routers/rts_client.js'));
app.use(morgan('dev')); // Log HTTP requests to the console
app.use(router)

db.sequelize.sync({ 
    //alter: true,
    force: false,
    logging: true
})
.then(() => {
    console.log('Base de datos y tablas sincronizadas.');
    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
})
.catch(err => console.error('Error al sincronizar la base de datos:', err));

