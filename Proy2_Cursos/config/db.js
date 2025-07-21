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

// 3. Definir las asociaciones entre modelos
const { users, courses } = db;


// Un usuario puede estar inscrito en muchos cursos.
users.belongsToMany(courses, { through: 'UserCourses', foreignKey: 'userId' });

// Un curso puede tener muchos estudiantes inscritos.
courses.belongsToMany(users, { through: 'UserCourses', foreignKey: 'courseId' });


courses.belongsTo(users, { foreignKey: 'userId' });

// 4. Exportar la conexión y los modelos para usarlos en otras partes de la app
module.exports = db;
