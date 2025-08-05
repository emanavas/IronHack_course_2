const {router} = require("#config/main_config.js")
const { User, Restaurant } = require("#root/config/db.js"); // Importamos los modelos de Sequelize
const {isAdmin} = require("#root/config/middleware.js")
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()




// --- Rutas Públicas ---
router.get("/", async (req, res) => {
    try {
        // get list of restaurants
        const restaurants = await Restaurant.findAll({});
        // Render the principal page
        res.render('principal', {
            session: req.session?.token_data,
            success: req?.flash('success'),
            error: req?.flash('error'),
            info: req?.flash('info'),
            restaurants: restaurants
        });
    } catch (error) {
        console.error(error);
        // If there's an error, render the principal page with the error message
        // Note: Use template literals for error messages
        // to ensure proper string interpolation
        return res.status(500).render('principal', {
            session: req.session,
            error: `Error: ${error.message}`
        });        
    }
    
});


// GET /login -> Muestra el formulario de login
router.get("/login", async (req, res) => {
    try{
        let users = [];
        // get all user to show a combobox and allow the user to select a user to login for easy access (development purpose)
        if (process.env.NODE_ENV === 'development') {
            users = await User.findAll({});
        }
        res.render('login', { users, error: req?.flash('error') });
    } catch (error) {
        console.error(error);
        res.status(500).send(`Error: ${error.message}`);
    }
})

// POST /login
router.post("/login", 
    [
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').trim(),
        body('password').notEmpty().withMessage('Password is required').isLength({ min: 5 }).withMessage('Password must be at least 5 characters').trim()
    ],
    async (req, res, next) => {        
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new Error(errors.array().map(error => `${error?.path}: ${error?.msg}
<br>`).join(''));
            }
            const { email, password } = req.body;
            // Check if user exists
            const existingUser = await User.findOne({ where: { email: email} });
            if (!existingUser) {
                throw new Error('User not found.');
            }
            // Check password using the instance method from the User model
            const passwordMatch = await existingUser.comparePassword(password);
            if (!passwordMatch) {
                throw new Error('Incorrect credentials.');
            }

            console.log('Welcome '+existingUser.firstName);
            
            // Create token
            const token = jwt.sign({
                firstName: existingUser.firstName,
                role: existingUser.role,
                userId: existingUser.userId
            }, process.env.TOKEN_SECRET)

            req.session.token = token;
            //depend on the role, redirect to the appropriate dashboard
            if (existingUser.role === 'platform_admin') {
                req.flash('success', 'Login successful');
                return res.redirect('/admin');
            } else if (existingUser.role === 'restaurant_admin') {
                // Comprueba si este administrador ya tiene un restaurante
                const restaurant = await Restaurant.findOne({ where: { adminUserId: existingUser.userId } });
                if (restaurant) {
                    req.flash('success', 'Login successful');
                    return res.redirect('/admin'); // Ir al panel de control si el restaurante existe
                } else {
                    req.flash('info', 'Welcome! Please create your restaurant profile to get started.');
                    return res.redirect('/restaurant/create'); // Ir al formulario de creación si no existe
                }
            }else{
                req.flash('success', 'Login successful');
                return res.redirect('/profile');
            }

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
router.get("/signup", (req, res) => {
    res.render('register');
});

// POST /registro
router.post("/signup", 
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
        body('role').notEmpty().withMessage('Role is required').isIn(['client', 'restaurant_admin', 'platform_admin']).withMessage('Invalid role selected.')
    ],
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new Error(errors.array().map(error => `${error?.path}: ${error?.msg}
<br>`).join(''));
        }
        // if all ok, create user into db
        const { name, email, password, role } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).render('register', {
                errors: 'User already exists.',
                oldData: req.body
            });
        }
        // Password hashing is handled by the 'beforeCreate' hook in the User model
        const user = await User.create({ 
            firstName: name, 
            email: email, 
            password: password, // Pass plaintext password
            role: role 
        });
        console.log('User created successfully');


        // Create token
        const token = jwt.sign({
            firstName: user.firstName,
            role: user.role,
            userId: user.userId
        }, process.env.TOKEN_SECRET)
        req.session.token = token;

        // check if the user has a restaurant profile
        if (role === 'restaurant_admin') {
            // Create a restaurant profile for the new restaurant admin
            //await Restaurant.create({ name: `${name}'s Restaurant`, adminUserId: user.userId });
            console.log('Restaurant profile created successfully');
            req.flash('success', 'Restaurant profile created successfully. Please complete your restaurant details.');
            return res.redirect('/restaurant/create'); // Redirect to restaurant creation form
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).render('register', {
            errors: error.message,
            oldData: req.body,
            session: req.session
        });
    }
});


// GET /logout
router.get("/logout", (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).send("Error ${error}");
    }
});


module.exports = router;
