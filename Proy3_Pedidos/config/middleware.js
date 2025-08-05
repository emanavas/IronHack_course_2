const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to check for a valid session token.
 * If a token is present, it verifies it and attaches the decoded data to `req.session.token_data`.
 */
const mw_check_session = (req, res, next) => {
    if (req.session?.token) {
        try {
            const token_data = jwt.verify(req.session.token, process.env.TOKEN_SECRET);
            req.session.token_data = token_data;
        } catch (error) {
            console.error("Invalid token:", error.message);
            delete req.session.token;
            delete req.session.token_data;
        }
    }
    next();
};

/**
 * Middleware to check if the user has an admin role.
 * @deprecated Use authorizeRole(['platform_admin', 'restaurant_admin']) instead for better clarity.
 */
const isAdmin = (req, res, next) => {
    if (req.session?.token_data && ['client','platform_admin', 'restaurant_admin'].includes(req.session.token_data.role)) {
        return next();
    }
    req.flash('error', 'You are not authorized to view this page.');
    return res.status(403).redirect('/');
};

/**
 * Middleware factory to authorize users based on their roles.
 * @param {string[]} roles - An array of roles that are allowed to access the route.
 * @returns {function} An Express middleware function.
 */
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.session?.token_data) {
            req.flash('error', 'You must be logged in to view this page.');
            return res.status(401).redirect('/login');
        }

        const { role } = req.session.token_data;
        if (roles.includes(role)) {
            return next();
        }

        req.flash('error', 'You do not have permission to access this page.');
        return res.status(403).redirect('/');
    };
};

module.exports = {
    mw_check_session,
    isAdmin,
    authorizeRole,
};