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
db.cursos = require('../models/curso.js')(sequelize);
// ... aquí importarías otros modelos si los tuvieras (ej. db.usuarios)

// 3. Sincronizar la base de datos (opcional, útil para desarrollo)
// Esto crea o modifica las tablas para que coincidan con los modelos.
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos y tablas sincronizadas con Sequelize.');
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
  });

// 4. Exportar la conexión y los modelos para usarlos en otras partes de la app
module.exports = db;
