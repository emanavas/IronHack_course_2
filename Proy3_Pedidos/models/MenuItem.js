const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MenuItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // A menu item belongs to one restaurant
      this.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });

      // A menu item belongs to one food category
      this.belongsTo(models.FoodCategory, {
        foreignKey: 'food_category_id',
        as: 'category',
      });
    }
  }

  MenuItem.init({
    menuItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'restaurant_id',
      },
    },
    foodCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'food_categories',
        key: 'food_category_id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.BLOB('long'), // Use BLOB to store binary data, 'long' for larger images
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'MenuItem',
    tableName: 'menu_items',
    timestamps: true,
    underscored: true,
    inCascade: true,
  });

  return MenuItem;
};