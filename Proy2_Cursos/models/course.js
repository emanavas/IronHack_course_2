const { DataTypes } = require('sequelize');

// Definimos el modelo como una función que recibe la instancia de sequelize
module.exports = (sequelize) => {
  // sequelize.define(nombreModelo, atributos, opciones)
  const Course = sequelize.define('course', {
    // No es necesario definir 'id', Sequelize lo añade automáticamente
    // como PRIMARY KEY AUTOINCREMENT
    title: {
      type: DataTypes.STRING,
      allowNull: false // Equivale a NOT NULL
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true // Valor por defecto
    },
    image: {
      type: DataTypes.BLOB,
      allowNull: true
    },

    //foreignKey
    // userId
  }, {
    tableName: 'courses', // Nos aseguramos que el nombre de la tabla sea 'cursos'
    //timestamps: false // No esperamos las columnas createdAt y updatedAt
  });

  return Course;
};