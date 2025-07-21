const config = require("#config/main_config.js")
const { users } = require("#root/config/db.js"); // Importamos el modelo de Sequelize
const {isAdmin} = require("#root/config/middleware.js")
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()




// --- Rutas Públicas ---

// GET /login -> Muestra el formulario de login
config.router.get("/login", (req, res) => {
    try{
        res.render('login', { error: req?.flash('error') });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error ${error}");
    }
})

// POST /login
config.router.post("/login", 
    [
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').trim(),
        body('password').notEmpty().withMessage('Password is required').isLength({ min: 5 }).withMessage('Password must be at least 5 characters').trim()
    ],
    async (req, res, next) => {        
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new Error(errors.array().map(error => `${error?.path}: ${error?.msg}\n<br>`).join(''));
            }
            const { email, password } = req.body;
            //check si ya existe
            const existingUser = await users.findOne({ where: { user: email} });
            if (!existingUser) {
                throw new Error('User not found.');
            }
            //check password
            const passwordMatch = await bcrypt.compare(password, existingUser.password);
            if (!passwordMatch) {
                throw new Error('Incorrect credentials.');
            }

            console.log('Welcome '+existingUser.name);
            
            //create token
            const token = jwt.sign({
                name: existingUser.name,
                admin: existingUser.isAdmin,
                userId: existingUser.id
            }, process.env.TOKEN_SECRET)

            req.session.token = token;
            return res.redirect('/courses');

        } catch (error) {
            return res.status(500).render('login', {
                    session: req.session,
                    errors: error.message,
                    oldData: req.body
            });
        }
    }
);

// --------------------------------------------------------/

// GET /registro 
config.router.get("/signup", (req, res) => {
    res.render('signup');
});

// POST /registro
config.router.post("/signup", 
    [
        body('name').notEmpty().withMessage('Name is required').trim(),
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').trim(),
        body('password').notEmpty().withMessage('Password is required').isLength({ min: 5 }).withMessage('Password must be at least 5 characters').trim(),
        body('confirmPassword').notEmpty().withMessage('Confirm Password is required').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),
        body('isAdmin').optional().isBoolean().withMessage('Invalid value for isAdmin').toBoolean()
    ],
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new Error(errors.array().map(error => `${error?.path}: ${error?.msg}\n<br>`).join(''));
        }
        // if all ok, create user into db
        const { name, email, password, isAdmin } = req.body;

        //check si ya existe
        const existingUser = await users.findOne({ where: { user: email } });
        if (existingUser) {
            return res.status(400).render('signup', {
                errors: [{ msg: 'User already exists.' }],
                oldData: req.body
            });
        }

        // Hashear la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await users.create({ name: name, user: email, password: hashedPassword, isAdmin: isAdmin });
        console.log('User not found');
        
        //create token
        const token = jwt.sign({
            name: name,
            admin: isAdmin,
            userId: user.id
        }, process.env.TOKEN_SECRET)

        req.session.token = token;
        
        res.redirect('/courses');
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).render('signup', {
            errors: error.message,
            oldData: req.body,
            session: req.session
        });
    }
});




module.exports = config.router;
