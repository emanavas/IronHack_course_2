const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db').sequelize; // Import the sequelize instance
const path = require('path');
require('dotenv').config();

module.exports = (sequelize) => {
  class User extends Model {
    // Instance method to compare passwords for login
    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // A user can have multiple addresses
      this.hasMany(models.Address, {
        foreignKey: 'user_id',
        as: 'addresses'
      });
      // A user with the 'restaurant_admin' role can manage one restaurant
      this.hasOne(models.Restaurant, {
        foreignKey: 'admin_user_id',
        as: 'restaurant',
      });
    }
  }

  User.init({
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    plaintextPassword: {
      type: DataTypes.STRING,
      set(value) {
        // get data from password field before hashing
        this.setDataValue('plaintextPassword', value);
      },
      get() {
        return this.getDataValue('plaintextPassword');
      }
    },
    role: {
      type: DataTypes.ENUM('client', 'restaurant_admin', 'platform_admin'),
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(100)
    },
    lastName: {
      type: DataTypes.STRING(100)
    },
    phoneNumber: {
      type: DataTypes.STRING(20)
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true, // Enables createdAt and updatedAt
    underscored: true, // Maps camelCase fields to snake_case columns (e.g., userId to user_id)
    inCascade: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          //store the plaintext password in a virtual field
          user.plaintextPassword = user.password;
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};