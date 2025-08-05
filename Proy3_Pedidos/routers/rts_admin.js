const { router } = require("#config/main_config.js");
const { authorizeRole } = require("#root/config/middleware.js");
const { sequelize, User, FoodCategory, Restaurant, Order, MenuItem } = require("#root/config/db.js");
const { body, validationResult } = require('express-validator');

// GET /admin - The main admin dashboard
router.get('/admin', 
    authorizeRole(['platform_admin', 'restaurant_admin']), 
    async (req, res) => {
    try {
        // redirect to platform admin dashboard if platform admin
        // get the user role from session
        const userId = req.session?.token_data?.userId;
        if (!userId) {
            req.flash('error', 'Unauthorized access to admin dashboard.');
            return res.redirect('/');
        }
        const user = await User.findByPk(userId);
        if (!user) {
            req.flash('error', 'Unauthorized access to admin dashboard.');
            return res.redirect('/');
        }
        // Check the user role and redirect accordingly
        if (user.role === 'platform_admin') {
            return res.redirect('/admin/dashboard');
        } else if (user.role === 'restaurant_admin') {
            return res.redirect('/restaurant/dashboard');
        } else {
            req.flash('error', 'Unauthorized access to admin dashboard.');
            return res.redirect('/');
        }
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        req.flash('error', 'Could not load the admin dashboard.');
        res.redirect('/');
    }
});


// GET /admin/platform - Platform admin dashboard
router.get('/admin/dashboard', authorizeRole(['platform_admin']), async (req, res) => {
    try {
        const [userCount, restaurantCount, categoryCount, totalOrders, totalRevenue, pendingOrders, deliveredOrders, menuItemsCount, orderStatusData] = await Promise.all([
            User.count(),
            Restaurant.count(),
            FoodCategory.count(),
            Order.count(),
            Order.sum('total_amount'),
            Order.count({ where: { status: 'pending' } }),
            Order.count({ where: { status: 'delivered' } }),
            MenuItem.count(),
            Order.findAll({
                attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
                group: ['status']
            }),
            // Restaurant.findAll({
            //     attributes: ['restaurant_category_id', [sequelize.fn('COUNT', sequelize.col('restaurant_category_id')), 'count']],
            //     include: [{
            //         model: FoodCategory,
            //         as: 'category',
            //         attributes: ['name']
            //     }],
            //     group: ['restaurant_category_id', 'category.name']
            // })
        ]);

        res.render('admin/dashboard', {
            session: req.session?.token_data,
            userCount,
            restaurantCount,
            categoryCount,
            totalOrders,
            totalRevenue: totalRevenue || 0,
            pendingOrders,
            deliveredOrders,
            menuItemsCount,
            orderStatusData: JSON.stringify(orderStatusData),
            //restaurantCategoryData: JSON.stringify(restaurantCategoryData),
            success: req.flash('success'),
            error: req.flash('error'),
            currentPath: req.path,
        });
    } catch (error) {
        console.error('Error loading platform admin dashboard:', error);
        req.flash('error', 'Could not load the platform admin dashboard.');
        res.redirect('/');
    }
});

// User Management Routes
router.get('/admin/users', authorizeRole(['platform_admin']), async (req, res) => {
    try {
        const users = await User.findAll({ order: [['userId', 'ASC']] });
        res.render('admin/users/index', {
            session: req.session?.token_data,
            users: users,
            success: req.flash('success'),
            error: req.flash('error'),
            currentPath: req.path,
        });
    } catch (error) {
        console.error('Error loading users:', error);
        req.flash('error', 'Could not load users.');
        res.redirect('/admin/dashboard');
    }
});

router.get('/admin/users/create', authorizeRole(['platform_admin']), (req, res) => {
    res.render('admin/users/form', {
        session: req.session?.token_data,
        errors: req.flash('error'),
        oldData: req.flash('oldData')[0] || {},
        currentPath: req.path
    });
});

router.post('/admin/users',
    authorizeRole(['platform_admin']),
    [
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').trim(),
        body('firstName').notEmpty().withMessage('First Name is required').trim(),
        body('password').notEmpty().withMessage('Password is required').isLength({ min: 5 }).withMessage('Password must be at least 5 characters').trim(),
        body('role').notEmpty().withMessage('Role is required').isIn(['client', 'restaurant_admin', 'platform_admin']).withMessage('Invalid role selected.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg).join('<br>'));
            req.flash('oldData', req.body);
            return res.redirect('/admin/users/create');
        }

        try {
            const { email, firstName, lastName, password, role } = req.body;
            await User.create({ email, firstName, lastName, password, role });
            req.flash('success', `User ${email} created successfully.`);
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Error creating user:', error);
            req.flash('error', 'Could not create user. Email may already be in use.');
            req.flash('oldData', req.body);
            res.redirect('/admin/users/create');
        }
    }
);

router.get('/admin/users/edit/:id', authorizeRole(['platform_admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/admin/users');
        }
        res.render('admin/users/form', {
            session: req.session?.token_data,
            user: user,
            errors: req.flash('error'),
            oldData: req.flash('oldData')[0] || {},
            currentPath: req.path
        });
    } catch (error) {
        console.error('Error loading user for edit:', error);
        req.flash('error', 'Could not load user for editing.');
        res.redirect('/admin/users');
    }
});

router.post('/admin/users/edit/:id',
    authorizeRole(['platform_admin']),
    [
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').trim(),
        body('firstName').notEmpty().withMessage('First Name is required').trim(),
        body('password').optional().isLength({ min: 5 }).withMessage('Password must be at least 5 characters if provided').trim(),
        body('role').notEmpty().withMessage('Role is required').isIn(['client', 'restaurant_admin', 'platform_admin']).withMessage('Invalid role selected.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg).join('<br>'));
            req.flash('oldData', req.body);
            return res.redirect(`/admin/users/edit/${req.params.id}`);
        }

        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                req.flash('error', 'User not found.');
                return res.redirect('/admin/users');
            }

            const { email, firstName, lastName, password, role } = req.body;
            const updateData = { email, firstName, lastName, role };
            if (password) {
                updateData.password = password; // Password hashing is handled by the model hook
            }

            await user.update(updateData);
            req.flash('success', `User ${user.email} updated successfully.`);
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Error updating user:', error);
            req.flash('error', 'Could not update user. Email may already be in use.');
            req.flash('oldData', req.body);
            res.redirect(`/admin/users/edit/${req.params.id}`);
        }
    }
);

router.post('/admin/users/delete/:id', authorizeRole(['platform_admin']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/admin/users');
        }
        await user.destroy();
        req.flash('success', `User ${user.email} deleted successfully.`);
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'Could not delete user.');
        res.redirect('/admin/users');
    }
});

// GET /admin/categories - Page to manage food categories
router.get('/admin/categories', authorizeRole(['platform_admin']), async (req, res) => {
    try {
        const categories = await FoodCategory.findAll({ order: [['name', 'ASC']] });
        res.render('admin/platform_categories', {
            session: req.session?.token_data,
            categories: categories,
            success: req.flash('success'),
            error: req.flash('error'),
            currentPath: req.path,
        });
    } catch (error) {
        console.error('Error loading food categories:', error);
        req.flash('error', 'Could not load food categories.');
        res.redirect('/admin/');
    }
});

// POST /admin/categories - Create a new food category
router.post('/admin/categories',
    authorizeRole(['platform_admin']),
    [
        body('name').notEmpty().withMessage('Category name is required.').trim(),
        body('description').optional().trim()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg).join('<br>'));
            return res.redirect('/admin/categories');
        }

        try {
            const { name, description } = req.body;
            await FoodCategory.create({ name, description });
            req.flash('success', `Category "${name}" created successfully.`);
            res.redirect('/admin/categories');
        } catch (error) {
            console.error('Error creating food category:', error);
            req.flash('error', 'Could not create category. It may already exist.');
            res.redirect('/admin/categories');
        }
    }
);

// POST /admin/categories/edit/:id - Update a food category
router.post('/admin/categories/edit/:id', authorizeRole(['platform_admin']), async (req, res) => {
    try {
        const { name, description } = req.body;
        await FoodCategory.update({ name, description }, { where: { foodCategoryId: req.params.id } });
        req.flash('success', 'Category updated successfully.');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error updating food category:', error);
        req.flash('error', 'Could not update category.');
        res.redirect('/admin/categories');
    }
});

// POST /admin/categories/delete/:id - Delete a food category
router.post('/admin/categories/delete/:id', authorizeRole(['platform_admin']), async (req, res) => {
    try {
        await FoodCategory.destroy({ where: { foodCategoryId: req.params.id } });
        req.flash('success', 'Category deleted successfully.');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error deleting food category:', error);
        req.flash('error', 'Could not delete category. It might be in use by menu items.');
        res.redirect('/admin/categories');
    }
});

module.exports = router;