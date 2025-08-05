const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // An Order belongs to one Client (User)
      this.belongsTo(models.User, {
        foreignKey: 'client_user_id',
        as: 'client', // Alias to distinguish from other user roles
      });

      // An Order belongs to one Restaurant
      this.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
      });

      // An Order has one specific delivery Address
      this.belongsTo(models.Address, {
        foreignKey: 'delivery_address_id',
        as: 'deliveryAddress',
      });

      // An Order is composed of many OrderItems
      this.hasMany(models.OrderItem, {
        foreignKey: 'orderId', // Corrected to match the camelCase key in the OrderItem model
        as: 'items',
      });
    }
  }

  Order.init({
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    client_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // table name
        key: 'user_id',
      },
    },
    restaurant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurants', // table name
        key: 'restaurant_id',
      },
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    delivery_address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'addresses', // table name
        key: 'address_id',
      },
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending','preparing','delivered'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid'),
      allowNull: false,
      defaultValue: 'pending',
    },
    delivery_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true, // Sequelize will automatically add createdAt and updatedAt
    // No 'underscored: true' here, as attributes are already snake_case
  });

  return Order;
};