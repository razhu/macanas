'use strict';
module.exports = {
  up: function(queryInterface, DataTypes) {
    return queryInterface.createTable('empresa',
    {
        id_empresa: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        nit: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        nit_json: {
            type: DataTypes.JSON,
            allowNull: true
        },
        matricula_comercio: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        matricula_comercio_json: {
            type: DataTypes.JSON,
            allowNull: true
        },
        estado: {
            type: DataTypes.ENUM('ACTIVO', 'INACTIVO', 'SIN_MATRICULA'),
            allowNull: false
        }
    });
  },
  down: function(queryInterface, DataTypes) {
    return queryInterface.dropTable('empresa');
  }
};