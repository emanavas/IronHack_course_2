const { Sequelize } = require('sequelize');
const path = require('path');

// 1. Configurar la conexión de Sequelize a la base de datos SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, './../db/db_app3.db'),
  logging: true // Cambiar a console.log para ver las queries SQL que Sequelize ejecuta
});

// 2. Cargar los modelos
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar el modelo 'User' (desde el archivo estandarizado) y añadirlo al objeto db
db.User = require('../models/user.js')(sequelize);
db.MenuItem = require('../models/MenuItem.js')(sequelize);
db.FoodCategory = require('../models/FoodCategory.js')(sequelize);
db.Restaurant = require('../models/Restaurant.js')(sequelize);
db.RestaurantCategory = require('../models/RestaurantCategory.js')(sequelize); // Assuming this exists
db.Order = require('../models/order.js')(sequelize);
db.OrderItem = require('../models/order_item.js')(sequelize);
db.Address = require('../models/address.js')(sequelize); // Assuming this exists based on Order model

// 3. Establecer las asociaciones entre los modelos
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// The project definition implies an Address model is needed for the Order relationship.
// I've added it to the db object assuming it exists at `../models/address.js`.
// If it doesn't exist, it will need to be created.

// 4. Exportar la conexión y los modelos para usarlos en otras partes de la app
module.exports = db;
