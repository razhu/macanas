module.exports = function (sequelize, DataTypes) {
    return sequelize.define('empresa', {
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
    }, {
        timestamps: false,
        paranoid: true,
        freezeTableName: true,
        classMethods: {
            associate: function (models) {


            }
        }
    });
};