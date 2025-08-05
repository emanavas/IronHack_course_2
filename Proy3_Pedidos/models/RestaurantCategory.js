const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RestaurantCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // Associations are defined in the Restaurant and FoodCategory models
    }
  }

  RestaurantCategory.init({
    restaurantId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'restaurants',
        key: 'restaurant_id',
      },
    },
    foodCategoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'food_categories',
        key: 'food_category_id',
      },
    },
  }, {
    sequelize,
    modelName: 'RestaurantCategory',
    tableName: 'restaurant_categories',
    timestamps: false, // Join tables usually don't need timestamps
    underscored: true,
    inCascade: true,
  });

  return RestaurantCategory;
};