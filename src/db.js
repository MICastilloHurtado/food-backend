require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const recipeModels = require('./models/Recipes')
const dietsModels = require('./models/Diets')
const path = require('path');
const {
  DB_USER, 
  DB_PASSWORD,
  DB_HOST,
  DB_URL
} = process.env;

const local = false // false para conectarse a DB deployada

const sequelize = local === false 
? new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/food`, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
})
: new Sequelize(DB_URL, {
  logging:false,
  native:false
});
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades

// Para relacionarlos hacemos un destructuring
const { Recipes, Diets } = sequelize.models;

// Aca vendrian las relaciones
Recipes.belongsToMany(Diets, { through: 'RecipeDiets' });
Diets.belongsToMany(Recipes, { through: 'RecipeDiets' });

module.exports = {
  ...sequelize.models,
  conn: sequelize 
      // para importart la conexión { conn } = require('./db.js');
};
