
const config = require("#config/main_config.js")
const path = require('path');
const db = require("#root/config/db.js")
const { body, validationResult } = require('express-validator');
const uuid = require('uuid')
const jwt = require('jsonwebtoken');

const { users } = db; // Usar el modelo de Sequelize


config.router.post("/api/users/register", 
    //validators 
    body('name').notEmpty().trim().isAscii(),
    body('user').notEmpty().trim().isAscii(),
    body('password').notEmpty().isAscii(),
    body('role').optional().isAscii().custom((value) => value.toLowerCase()).isIn(['admin', 'user']),
    async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, user, password, role } = req.body;

    //actions
    try {
        const newUser = await users.create({ name, user, password, role });
        console.log('Usuario insertado correctamente');
        req.session.user = newUser.name;
        req.session.admin = newUser.role === 'admin';
        req.session.save();

        //response
        res.status(201).send({name: newUser.name});
    } catch (error) {
        // Manejar error de unicidad de usuario
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send({ message: 'El usuario ya existe.' });
        }
        res.status(500).send({ message: 'Error al registrar el usuario', error });
        console.error('Error al insertar datos:', error);
    }
})


config.router.post("/api/users/login", 
    //validators 
    body('user').notEmpty().trim().isAscii(),
    body('password').notEmpty().isAscii(),
    async (req, res) => {
    
    const { user, password } = req.body;

    //actions
    try {
        const foundUser = await users.findOne({ where: { user: user, password: password } });
        
        if (foundUser) {
            //create token
            const token = jwt.sign({
                name: foundUser.name,
                admin: foundUser.role === 'admin',
            }, process.env.TOKEN_SECRET);

            req.session.user = foundUser.name;
            req.session.admin = foundUser.role === 'admin';
            req.session.token = token;
            req.session.save();
            
            return res.status(200).send({ name: foundUser.name });
        } else {
            return res.status(401).send({ message: 'Usuario o contraseña incorrectos.' });
        }
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).send({ message: 'Error en el servidor durante el login.' });
    }
})

config.router.get("/api/users/logout", async (req, res) => {
    req.session.destroy();
    res.redirect('/')
})

module.exports = config.router;
