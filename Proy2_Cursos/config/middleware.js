
const {session} = require("#config/main_config.js")
const {db} = require("#root/config/db.js")
const jwt = require('jsonwebtoken');
require('dotenv').config()


const mw_check_session = async (req, res, next) => {
    try {
        if (req?.session?.token){
            const token = req.session.token
            const token_data = jwt.verify(token, process.env.TOKEN_SECRET)
            req.token = token_data
            
            //modify session
            req.session.user = token_data.name
            req.session.admin = token_data.admin
            req.session.save()
        } 
        next()
            
    } catch (error) {
        console.warning(error)
    }
    
};

// --- Middleware de autorización ---
// Verifica si el usuario en la sesión es un administrador
const isAdmin = (req, res, next) => {
    if (req.session && req.session.admin) {
        return next();
    }
    res.status(403).render('error', { 
        message: 'Acceso Denegado', 
        error: { status: 403, stack: 'No tienes permisos de administrador para acceder a esta página.' },
        session: req.session
    });
};


module.exports = {
    mw_check_session,isAdmin
}