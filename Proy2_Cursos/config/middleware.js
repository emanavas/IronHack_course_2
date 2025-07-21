
const {session} = require("#config/main_config.js")
const {db} = require("#root/config/db.js")
const jwt = require('jsonwebtoken');
require('dotenv').config()


const decodeToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        return decoded
    } catch (error) {
        return null
    }
}


const mw_check_session = async (req, res, next) => {
    try {
        if (req?.session?.token){
            const token_data = decodeToken(req.session.token)
            //check token
            if (!token_data){
                req.session.destroy()
                console('token invalido')
            }else{
                req.session.token_data = token_data
                req.session.touch()
            }
        }
        if (!req?.session) {
            req.session = await session.create()
        }
    } catch (error) {
        console.warning(error)
    } finally {
        next()
    }
};


// --- Middleware de autorización ---
// Verifica si el usuario en la sesión es un administrador
const isAdmin = (req, res, next) => {
    try {
        if (req?.session?.token) {
            const token_data = decodeToken(req.session.token);
            if (token_data && token_data.admin) {
                return next();
            }
        }else{
            // res.status(403).json({ 
            //     message: 'Access denied'
            // });
            res.render('login', {
                session: req.session,
                errors: 'Access denied, please login as Administrator.'
            })
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
    
};


module.exports = {
    mw_check_session,isAdmin,decodeToken
};
