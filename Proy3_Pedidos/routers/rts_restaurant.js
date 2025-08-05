const { router, upload } = require("#config/main_config.js");
const { authorizeRole } = require("#root/config/middleware.js");
const { Restaurant, FoodCategory, MenuItem, Order, OrderItem, User, Address } = require("#root/config/db.js");
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

// GET /restaurant - El panel de control principal del restaurante
router.get('/restaurant/dashboard', authorizeRole(['restaurant_admin', 'platform_admin']), async (req, res) => {
    try {
        const userId = req.session?.token_data?.userId;
        const restaurant = await Restaurant.findOne({ where: { adminUserId: userId } });

        if (!restaurant) {
            req.flash('error', 'You do not have a restaurant profile. Please create one.');
            return res.redirect('/restaurant/create');
        }

        // Fetch real data
        const orders = await Order.findAll({
            where: { restaurant_id: restaurant.restaurantId },
            include: [
                { model: User, as: 'client' },
                { model: OrderItem, as: 'items', include: { model: MenuItem, as: 'menuItem' } }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calculate total for each order
        orders.forEach(order => {
            order.calculatedTotal = order.items.reduce((acc, item) => acc + (item.quantity * item.menuItem.price), 0);
        });

        const stats = {
            newOrders: orders.filter(o => o.status === 'pending').length,
            inProcess: orders.filter(o => o.status === 'preparing').length,
            completed: orders.filter(o => o.status === 'delivered').length,
            todaysRevenue: orders
                .filter(o => o.status === 'delivered' && new Date(o.createdAt).toDateString() === new Date().toDateString())
                .reduce((acc, o) => acc + o.calculatedTotal, 0)
        };

        // Render the restaurant dashboard
        res.render('restaurant/dashboard', {
            restaurant: restaurant,
            session: req.session?.token_data,
            stats: stats,
            orders: orders, // Use fetched orders
            success: req?.flash('success'),
            error: req?.flash('error'),
            info: req?.flash('info'),
            currentPath: req.path,
        });

    } catch (error) {
        console.error('Error loading restaurant dashboard:', error.message);
        req.flash('error', 'Could not load the restaurant dashboard.');
        res.redirect('/');
    }
});

// GET /restaurant/profile - Muestra el perfil del restaurante
router.get('/restaurant/profile', authorizeRole(['restaurant_admin', 'platform_admin']), async (req, res) => {
    try {
        const userId = req.session?.token_data?.userId;
        const restaurant = await Restaurant.findOne({ where: { adminUserId: userId } });

        // if (!restaurant) {
        //     req.flash('info', 'You do not have a restaurant profile yet. Please create one.');
        //     return res.redirect('/restaurant/create');
        // }

        res.render('restaurant/profile', {
            restaurant: restaurant,
            session: req.session?.token_data,
            success: req.flash('success'),
            error: req.flash('error'),
            currentPath: req.path
        });
    } catch (error) {
        console.error('Error loading restaurant profile:', error.message);
        req.flash('error', 'Could not load your restaurant profile.');
        res.send('Error loading restaurant profile.'+error.message);
    }
});


// GET /restaurant/create - Muestra el formulario para crear un restaurante
router.get('/restaurant/create', authorizeRole(['restaurant_admin']), async ( req, res ) => {
    try {
        // Render the restaurant creation form
        // Note: Ensure that the session token data is passed correctly
        // If the user already has a restaurant, redirect to the profile page
        // get list of restaurant for this user

        const restaurant = await Restaurant.findOne({ where: { adminUserId: req.session?.token_data?.userId } });
        if (restaurant) {
            req.flash('info', 'You already have a restaurant profile. Please update it instead.');
            return res.redirect('/admin');
        }

        res.render('restaurant/create_restaurant', {
            session: req.session?.token_data,
            success: req?.flash('success'),
            error: req?.flash('error'),
            info: req?.flash('info'),
            currentPath: req.path
        });
    } catch (error) {
        console.error('Error loading restaurant creation form:', error.message);
        req.flash('error', 'Could not load the restaurant creation form.');
        return res.redirect('/admin');
        
    }
    
});

// POST /restaurant/create - Procesa el envío del formulario para crear un restaurante
router.post('/restaurant/create', authorizeRole(['restaurant_admin']), async (req, res) => {
    try {
        const { name, description, cuisine, address, phoneNumber, openingHours } = req.body;

        // Aquí puedes agregar la lógica para crear un nuevo restaurante en la base de datos
        // Por ejemplo:
         await Restaurant.create({ 
            name:name, 
            description:description, 
            cuisine:cuisine, 
            address:address, 
            phoneNumber:phoneNumber, 
            openingHours:openingHours,
            adminUserId: req.session?.token_data?.userId
        });

        req.flash('success', 'Restaurant created successfully.');
        res.redirect('/admin');
    } catch (error) {
        console.error('Error creating restaurant:', error.message);
        req.flash('error', 'Could not create the restaurant.');
        res.redirect('/restaurant/create');
    }
});

router.get('/restaurant/menu', authorizeRole(['restaurant_admin', 'platform_admin']), async (req, res) => {

    //this route allow show form to create a restaurant menu
    try {
        const userId = req.session?.token_data?.userId;
        const restaurant = await Restaurant.findOne({ where: { adminUserId: userId } });
        if (!restaurant) {
            req.flash('error', 'You do not have a restaurant profile. Please create one.');
            return res.redirect('/restaurant/create');
        }
        // get all food categories
        const foodCategories = await FoodCategory.findAll();
        // get list of menu items for the restaurant
        const menuItems = await MenuItem.findAll({
            where: { restaurantId: restaurant.restaurantId },
            include: [{ model: FoodCategory, as: 'category' }]
        });

        res.render('restaurant/menu', {
            menuItems: menuItems,
            restaurant: restaurant,
            foodCategories: foodCategories,
            session: req.session?.token_data,
            success: req.flash('success'),
            error: req.flash('error'),
            currentPath: req.path,
        });
    } catch (error) {
        console.error('Error loading restaurant menu:', error.message);
        req.flash('error', 'Could not load the restaurant menu.');
        res.redirect('/admin');
    }
});

// post /restaurant/menu - Process the form submission to create a restaurant menu
router.post('/restaurant/menu', authorizeRole(['restaurant_admin']),
    // validators
    // [
    //     body('name').notEmpty().withMessage('Menu name is required'),
    //     body('description').notEmpty().withMessage('Menu description is required'),
    //     body('price').notEmpty().withMessage('Menu price is required').trim(),
    //     body('foodCategoryId').notEmpty().withMessage('Food category is required'),
    // ],
    upload.single('image'), // Use multer middleware here to handle the file upload
    async (req, res) => {
    try {
        // get values from the request body
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     throw new Error(errors.array().map(error => `${error?.path}: ${error?.msg}\n<br>`).join(''));
        // }
        // get the items from the request body
        const { name, description, price, foodCategoryId } = req.body;
        const imageBuffer = req.file ? req.file.buffer : null; // Get the image buffer

        // Aquí puedes agregar la lógica para crear un nuevo menú en la base de datos
        // Por ejemplo:
        // get the restaurant id from session token data userId
        const userId = req.session?.token_data?.userId;
        const restaurant = await Restaurant.findOne({ where: { admin_user_id: userId } });
        await MenuItem.create({
            name: name,
            description: description,
            price: price,
            image: imageBuffer, // Store the buffer directly
            restaurantId: restaurant.restaurantId,
            foodCategoryId: foodCategoryId 
        });

        req.flash('success', 'Menu created successfully.');
        res.redirect('/restaurant/menu');
    } catch (error) {
        console.error('Error creating restaurant menu:', error.message);
        req.flash('error', 'Could not create the restaurant menu.' + error.message);
        res.redirect('/restaurant/menu');
    }
});

// edit menu item
router.post('/restaurant/menu/edit/:menuItemId', authorizeRole(['restaurant_admin']), upload.single('image'), async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const { name, description, price, foodCategoryId } = req.body;
        const userId = req.session?.token_data?.userId;

        const restaurant = await Restaurant.findOne({ where: { adminUserId: userId } });
        if (!restaurant) {
            req.flash('error', 'You do not have a restaurant profile. Please create one.');
            return res.redirect('/restaurant/create');
        }

        const menuItem = await MenuItem.findOne({
            where: {
                menuItemId: menuItemId,
                restaurantId: restaurant.restaurantId
            }
        });

        if (!menuItem) {
            req.flash('error', 'Menu item not found.');
            return res.redirect('/restaurant/menu');
        }

        const updateData = { name, description, price, foodCategoryId };
        if (req.file) {
            updateData.image = req.file.buffer;
        }

        await menuItem.update(updateData);
        req.flash('success', 'Menu item updated successfully.');
        res.redirect('/restaurant/menu');
    } catch (error) {
        console.error('Error updating menu item:', error.message);
        req.flash('error', 'Could not update the menu item.');
        res.redirect('/restaurant/menu');
    }
});

// DELETE /restaurant/menu/:menuItemId - Delete a menu item
router.delete('/restaurant/menu/:menuItemId', authorizeRole(['restaurant_admin']), async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const userId = req.session?.token_data?.userId;
        const restaurant = await Restaurant.findOne({ where: { adminUserId: userId } });
        if (!restaurant) {
            req.flash('error', 'You do not have a restaurant profile. Please create one.');
            return res.redirect('/restaurant/create');
        }
        const menuItem = await MenuItem.findOne({ where: { 
            menuItemId: menuItemId,
            restaurantId: restaurant.restaurantId
        } });
        if (!menuItem) {
            req.flash('error', 'Menu item not found.');
            return res.redirect('/restaurant/menu');
        }
        await menuItem.destroy();
        req.flash('success', 'Menu item deleted successfully.');
        res.redirect('/restaurant/menu');
    } catch (error) {
        console.error('Error deleting menu item:', error.message);
        req.flash('error', 'Could not delete the menu item.');
        res.redirect('/restaurant/menu');
    }
});


// POST /restaurant/categories - Create a new food category
router.post('/restaurant/categories', authorizeRole(['restaurant_admin', 'platform_admin']), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required.' });
        }

        const newCategory = await FoodCategory.create({ name });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating food category:', error.message);
        res.status(500).json({ error: 'Could not create the food category.' });
    }
});

// GET /restaurants/:restaurantId - Show a single restaurant and its menu
router.get('/restaurants/:restaurantId', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByPk(req.params.restaurantId);
        if (!restaurant) {
            req.flash('error', 'Restaurant not found.');
            return res.redirect('/');
        }

        const menuItems = await MenuItem.findAll({
            where: { restaurantId: req.params.restaurantId },
            include: [{ model: FoodCategory, as: 'category' }]
        });

        res.render('restaurant/show', {
            restaurant,
            menuItems,
            session: req.session?.token_data,
            success: req.flash('success'),
            error: req.flash('error'),
            currentPath: req.path
        });
    } catch (error) {
        console.error('Error loading restaurant page:', error.message);
        req.flash('error', 'Could not load the restaurant page.');
        res.redirect('/');
    }
});

router.get('/restaurant/orders', authorizeRole(['restaurant_admin', 'platform_admin']), async (req, res) => {
    try {
        const userId = req.session?.token_data?.userId;
        const restaurant = await Restaurant.findOne({ where: { adminUserId: userId } });

        if (!restaurant) {
            req.flash('error', 'You do not have a restaurant profile. Please create one.');
            return res.redirect('/restaurant/create');
        }

        const orders = await Order.findAll({
            where: { restaurant_id: restaurant.restaurantId },
            include: [
                { model: User, as: 'client' },
                { model: Address, as: 'deliveryAddress' },
                { model: OrderItem, as: 'items', include: [{ model: MenuItem, as: 'menuItem' }] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.render('restaurant/orders', {
            orders,
            restaurant,
            session: req.session?.token_data,
            success: req.flash('success'),
            error: req.flash('error'),
            currentPath: req.path,
        });

    } catch (error) {
        console.error('Error loading restaurant orders:', error.message);
        req.flash('error', 'Could not load restaurant orders.');
        res.redirect('/restaurant/dashboard');
    }
});

router.post('/restaurant/orders/:orderId/status', authorizeRole(['restaurant_admin', 'platform_admin']), async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const userId = req.session?.token_data?.userId;

        const restaurant = await Restaurant.findOne({ where: { adminUserId: userId } });
        if (!restaurant) {
            req.flash('error', 'Restaurant not found.');
            return res.redirect('/restaurant/dashboard');
        }

        const order = await Order.findOne({ where: { order_id: orderId, restaurant_id: restaurant.restaurantId } });

        if (!order) {
            req.flash('error', 'Order not found or does not belong to your restaurant.');
            return res.redirect('/restaurant/orders');
        }

        // Validate status transition if needed
        const validStatuses = ['pending', 'preparing', 'delivered'];
        if (!validStatuses.includes(status)) {
            req.flash('error', 'Invalid status provided.');
            return res.redirect('/restaurant/orders');
        }

        await order.update({ status });

        req.flash('success', `Order #${orderId} status updated to ${status}.`);
        res.redirect('/restaurant/orders');

    } catch (error) {
        console.error('Error updating order status:', error.message);
        req.flash('error', 'Could not update order status: ' + error.message);
        res.redirect('/restaurant/orders');
    }
});

module.exports = router;