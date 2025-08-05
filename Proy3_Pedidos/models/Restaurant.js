const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // A restaurant is managed by one admin user
      this.belongsTo(models.User, {
        foreignKey: 'adminUserId',
        as: 'admin',
      });
      // A restaurant can have many menu items
      this.hasMany(models.MenuItem, {
        foreignKey: 'restaurantId',
        as: 'menuItems'
      });
      // A restaurant can have many orders (to be implemented)
      // this.hasMany(models.Order, { foreignKey: 'restaurantId', as: 'orders' });
      this.belongsToMany(models.FoodCategory, {
        through: models.RestaurantCategory,
        foreignKey: 'restaurant_id',
        otherKey: 'food_category_id',
        as: 'categories',
      });
    }
  }

  Restaurant.init({
    restaurantId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    adminUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Each admin user can only manage one restaurant
      references: {
        model: 'users', // table name
        key: 'user_id', // column name in users table
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    cuisine: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
    },
    openingHours: {
      type: DataTypes.STRING, // Can be upgraded to JSON for more complex schedules
    },
  }, {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'restaurants',
    timestamps: true,
    underscored: true,
    inCascade: true,
  });

  return Restaurant;
};