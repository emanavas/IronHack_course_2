const { router } = require("#config/main_config.js");
const { authorizeRole } = require("#root/config/middleware.js");
const { Restaurant } = require("#root/config/db.js");

// --- Rutas Públicas ---
router.get("/profile", authorizeRole(['client','restaurant_admin', 'platform_admin']), async (req, res) => {
    try {
        // get from session role
        const userRole = req.session?.token_data?.role;
        // Render the profile page based on user role
        if (userRole === 'client') {
            return res.redirect('/client/profile');
        } else if (userRole === 'restaurant_admin') {
            return res.redirect('/restaurant/profile');
        } else if (userRole === 'platform_admin') {
            return res.redirect('/admin');
        } else {
            req.flash('error', 'Unauthorized access.');
            return res.redirect('/');
        }
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

router.get('/cart', (req, res) => {
    res.render('cart', {
        session: req.session?.token_data,
        success: req.flash('success'),
        error: req.flash('error'),
        currentPath: req.path,
    });
});

module.exports = router;