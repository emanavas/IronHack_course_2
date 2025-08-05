const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class FoodCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // A food category can have many menu items
      this.hasMany(models.MenuItem, {
        foreignKey: 'food_category_id',
        as: 'menu_items'
      });
      this.belongsToMany(models.Restaurant, {
        through: models.RestaurantCategory,
        foreignKey: 'food_category_id',
        otherKey: 'restaurant_id',
        as: 'restaurants',
      });
    }
  }

  FoodCategory.init({
    foodCategoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'FoodCategory',
    tableName: 'food_categories',
    timestamps: true,
    underscored: true,
    inCascade: true,
  });

  return FoodCategory;
};