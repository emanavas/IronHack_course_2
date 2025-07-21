const app = require('./index');
const db = require('#root/config/db.js');
const port = process.env.PORT || 3002;

db.sequelize.sync({ 
  //alter: true,
  //force: false,
  logging: true
 })
  .then(() => {
    console.log('Base de datos y tablas sincronizadas.');
    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  })
  .catch(err => console.error('Error al sincronizar la base de datos:', err));