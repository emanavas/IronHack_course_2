const { router } = require("#config/main_config.js");
const { Restaurant, FoodCategory, Sequelize } = require("#root/config/db.js");
const { Op } = Sequelize;

// GET /restaurants - List all restaurants with filtering
router.get('/restaurants', async (req, res) => {
    try {
        const { search, cuisine } = req.query;
        const whereClause = {};
        const includeOptions = {
            model: FoodCategory,
            as: 'categories',
            attributes: ['name'],
            through: { attributes: [] } // Don't include the join table attributes
        };

        if (search) {
            // Search by restaurant name or description
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (cuisine) {
            // Filter by cuisine by checking the associated FoodCategory name
            includeOptions.where = { name: { [Op.like]: `%${cuisine}%` } };
            // Make it an INNER JOIN if filtering by cuisine to only get restaurants of that cuisine
            includeOptions.required = true;
        }

        const restaurants = await Restaurant.findAll({
            where: whereClause,
            include: [includeOptions]
        });

        res.render('restaurants', {
            restaurants,
            session: req.session?.token_data,
            error: req.flash('error'),
            currentPath: req.path,
        });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        req.flash('error', 'Could not load restaurants.');
        res.redirect('/');
    }
});

module.exports = router;