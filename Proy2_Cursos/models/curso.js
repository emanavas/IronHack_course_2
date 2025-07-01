const { DataTypes } = require('sequelize');

// Definimos el modelo como una función que recibe la instancia de sequelize
module.exports = (sequelize) => {
  // sequelize.define(nombreModelo, atributos, opciones)
  const Curso = sequelize.define('Curso', {
    // No es necesario definir 'id', Sequelize lo añade automáticamente
    // como PRIMARY KEY AUTOINCREMENT
    titulo: {
      type: DataTypes.STRING,
      allowNull: false // Equivale a NOT NULL
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false
    },
    visibilidad: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'publico' // Valor por defecto
    }
  }, {
    tableName: 'cursos', // Nos aseguramos que el nombre de la tabla sea 'cursos'
    timestamps: false // No esperamos las columnas createdAt y updatedAt
  });

  return Curso;
};