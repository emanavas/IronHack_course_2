const {router} = require("#config/main_config.js")
const { User, Order, OrderItem, Address, MenuItem, FoodCategory, Restaurant } = require("#root/config/db.js"); // Importamos el modelo de Sequelize
const {authorizeRole} = require("#root/config/middleware.js")
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()




// --- Rutas Públicas ---

router.get("/client/profile", authorizeRole(['client']), async (req, res) => {
    try {
        // get user information from database
        const Client = await User.findOne({ 
            where: { user_id: req.session?.token_data?.userId },
            include: [{ model: Address, as: 'addresses' }] 
        });
        if (!Client) {
            req.flash('error', 'You do not have a client profile. Please create one.');
            return res.redirect('/client/create');
        }

        // prepare data for rendering
        const orders = await Order.findAll({
            where: { client_user_id: req.session?.token_data?.userId },
            include: [
                { model: OrderItem, as: 'items', include: [{ model: MenuItem, as: 'menuItem' }] },
                { model: Address, as: 'deliveryAddress' } // Include the Address model
            ],
            order: [['createdAt', 'DESC']]
        });
        // fake orders data for demonstration
        // const orders = [
        //     { orderId: '1001', restaurant: 'Pizza Place', items: 2, total: 30.00, status: 'Delivered' },
        //     { orderId: '1002', restaurant: 'Burger Joint', items: 1, total: 12.50, status: 'In Process' },
        //     { orderId: '1003', restaurant: 'Sushi Spot', items: 3, total: 45.75, status: 'Pending' },
        // ];



        // Render the client profile page
        res.render('client/profile', {
            session: req.session?.token_data,
            user: Client,
            orders: orders,
            addresses: Client.addresses || [],
            success: req?.flash('success'),
            error: req?.flash('error'),
            info: req?.flash('info'),
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(`Error: ${error.message}`);
    }
});

router.post("/checkout", authorizeRole(['client']), async (req, res) => {
    try {
        // check if not logged in
        if (!req.session?.token_data) {
            req.flash('error', 'You must be logged in to place an order.');
            return res.redirect('/login');
        }
        const cart = JSON.parse(req.body.cart); // Parse the JSON string from the hidden input
        const userId = req.session?.token_data?.userId;

        if (!cart || cart.length === 0) {
            req.flash('error', 'Your cart is empty.');
            return res.redirect('/cart');
        }

        const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

        // check if user has deliverhy address from database
        const deliveryAddress = await Address.findOne({
            where: { user_id: userId }
        });
        if (!deliveryAddress) {
            req.flash('error', 'You must have a delivery address to place an order.');
            return res.redirect('/client/profile');
        }
        const order = await Order.create({
            client_user_id: userId,
            restaurant_id: 1, // This should be dynamic based on the cart items
            delivery_address_id : deliveryAddress.addressId,
            total_amount: totalAmount,
        });

        for (const item of cart) {
            await OrderItem.create({
                orderId: order.order_id,
                menuItemId: item.id,
                quantity: item.quantity,
                unitPrice: item.price,
            });
        }

        res.redirect(`/order/confirmation/${order.order_id}`); // Redirect to confirmation page
    } catch (error) {
        console.error(error);
        req.flash('error', 'There was an error processing your order.');
        res.status(500).send({ error: error.message });
    }
});

router.get("/order/confirmation/:orderId", authorizeRole(['client']), async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { order_id: req.params.orderId, client_user_id: req.session?.token_data?.userId },
            include: [{ model: OrderItem, as: 'items', include: ['menuItem'] }]
        });

        if (!order) {
            req.flash('error', 'Order not found.');
            return res.redirect('/');
        }

        res.render('client/order_confirmation', {
            session: req.session?.token_data,
            order: order,
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'There was an error retrieving your order confirmation.');
        res.redirect('/');
    }
});

router.post("/client/profile/address/add", authorizeRole(['client']), async (req, res) => {
    try {
        const { street, aptSuite, city, state, zipCode } = req.body;
        const userId = req.session?.token_data?.userId;

        if (!street || !city || !state || !zipCode) {
            req.flash('error', 'Street, city, state, and zip code are required for adding an address.');
            return res.redirect('/client/profile');
        }
        // check user ID
        if (!userId) {
            req.flash('error', 'You must be logged in to add an address.');
            return res.redirect('/login');
        }

        await Address.create({
            userId: userId,
            street: street,
            city: city,
            state: state,
            zipCode: zipCode,
            isDefault: false // Assuming new addresses are not default by default
        });

        req.flash('success', 'Address added successfully.');
        res.redirect('/client/profile');
    } catch (error) {
        console.error('Error adding address:', error.message);
        req.flash('error', 'Could not add address: ' + error.message);
        res.redirect('/client/profile');
    }
});

router.post("/client/profile/address/edit/:addressId", authorizeRole(['client']), async (req, res) => {
    try {
        const { addressId } = req.params;
        const { street, aptSuite, city, state, zipCode, isDefault } = req.body;
        const userId = req.session?.token_data?.userId;

        const address = await Address.findOne({ where: { addressId, userId } });

        if (!address) {
            req.flash('error', 'Address not found or does not belong to you.');
            return res.redirect('/client/profile');
        }

        await address.update({
            street,
            aptSuite: aptSuite || null,
            city,
            state,
            zipCode,
        });

        if (isDefault === '1') {
            // Set all other addresses for this user to not default
            await Address.update({ isDefault: false }, {
                where: {
                    userId: userId,
                    addressId: { [Op.ne]: addressId }
                }
            });
            // Set this address as default
            await address.update({ isDefault: true });
        } else if (address.isDefault && isDefault !== '1') {
            // If it was default and now it's not, ensure there's still a default or handle appropriately
            // For simplicity, we'll just unset it. A more robust solution might require selecting a new default.
            await address.update({ isDefault: false });
        }

        req.flash('success', 'Address updated successfully.');
        res.redirect('/client/profile');
    } catch (error) {
        console.error('Error updating address:', error.message);
        req.flash('error', 'Could not update address: ' + error.message);
        res.redirect('/client/profile');
    }
});

router.post("/client/profile/address/delete/:addressId", authorizeRole(['client']), async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.session?.token_data?.userId;

        const address = await Address.findOne({ where: { addressId, userId } });

        if (!address) {
            req.flash('error', 'Address not found or does not belong to you.');
            return res.redirect('/client/profile');
        }

        await address.destroy();

        req.flash('success', 'Address deleted successfully.');
        res.redirect('/client/profile');
    } catch (error) {
        console.error('Error deleting address:', error.message);
        req.flash('error', 'Could not delete address: ' + error.message);
        res.redirect('/client/profile');
    }
});

router.post("/client/profile/address/set-default/:addressId", authorizeRole(['client']), async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.session?.token_data?.userId;

        // Set all other addresses for this user to not default
        await Address.update({ isDefault: false }, {
            where: {
                userId: userId,
                addressId: { [Op.ne]: addressId }
            }
        });

        // Set the selected address as default
        const address = await Address.findOne({ where: { addressId, userId } });
        if (address) {
            await address.update({ isDefault: true });
            res.json({ message: 'Default address set successfully.' });
        } else {
            res.status(404).json({ error: 'Address not found or does not belong to you.' });
        }

    } catch (error) {
        console.error('Error setting default address:', error.message);
        res.status(500).json({ error: 'Could not set default address: ' + error.message });
    }
});

module.exports = router;