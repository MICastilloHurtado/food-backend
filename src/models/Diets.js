const {DataTypes} = require('sequelize')
//exportamos la funcion que define el modelo
//luego le creamos la conexion con sequelize
module.exports = (sequelize) => {
    //defino el modelo
    sequelize.define('diets', {
        id:{
            type:DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name:{
            type:DataTypes.STRING,
            allowNull: false
        },
    },{timestamps: false})
}