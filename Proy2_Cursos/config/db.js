const { Sequelize } = require('sequelize');
const path = require('path');

// 1. Configurar la conexión de Sequelize a la base de datos SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, './../db/db_app2.db'),
  logging: false // Cambiar a console.log para ver las queries SQL que Sequelize ejecuta
});

// 2. Cargar los modelos
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar el modelo 'Curso' y añadirlo al objeto db
db.courses = require('../models/course.js')(sequelize);
// Importar el modelo 'User' (desde el archivo estandarizado) y añadirlo al objeto db
db.users = require('../models/user.js')(sequelize);


db.user_courses = require('../models/user_courses.js')(sequelize);


// 3. Definir las asociaciones entre modelos
const { users, courses, user_courses } = db;


// Many-to-many for subscriptions:
// A user can be subscribed to many courses.
users.belongsToMany(courses, { through: user_courses, foreignKey: 'userId' });

// A course can have many subscribed users.
courses.belongsToMany(users, { through: user_courses, foreignKey: 'courseId' });

// One-to-many for course creation:
courses.belongsTo(users, { foreignKey: 'userId' }); // A course is created by a user
users.hasMany(courses, { foreignKey: 'userId' }); // A user can create many courses

// Explicit associations to the join table to allow direct queries on it.
user_courses.belongsTo(users, { foreignKey: 'userId' });
users.hasMany(user_courses, { foreignKey: 'userId' });
user_courses.belongsTo(courses, { foreignKey: 'courseId' });
courses.hasMany(user_courses, { foreignKey: 'courseId' });

// 4. Exportar la conexión y los modelos para usarlos en otras partes de la app
module.exports = db;
