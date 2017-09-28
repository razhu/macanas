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
        matricula_comercio: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        resultado: {
            type: DataTypes.JSON,
            allowNull: false
        },
        estado: {
            type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
            allowNull: false,
            defaultValue: 'INACTIVO'
        }
    },
        {
            timestamps: false,
            paranoid: true,
            freezeTableName: true,
            classMethods: {
                associate: function (models) {


                }
            }
        });
};
