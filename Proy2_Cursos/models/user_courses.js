const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User_Courses = sequelize.define('User_Courses', {}, {
        tableName: 'user_courses',
    });

    return User_Courses;
};
