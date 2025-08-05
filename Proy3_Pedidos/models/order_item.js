const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // An OrderItem belongs to one Order
      this.belongsTo(models.Order, {
        foreignKey: 'orderId', // This will be 'order_id' in the database
        as: 'order'
      });

      // An OrderItem corresponds to one MenuItem
      this.belongsTo(models.MenuItem, {
        foreignKey: 'menuItemId', // This will be 'menu_item_id' in the database
        as: 'menuItem'
      });
    }
  }

  OrderItem.init({
    orderItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'order_id',
      },
    },
    menuItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'menu_items',
        key: 'menu_item_id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true,
    underscored: true, // Maps camelCase fields to snake_case columns
  });

  return OrderItem;
};