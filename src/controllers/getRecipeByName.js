const axios = require('axios')
require('dotenv').config();
const {API_KEY} = process.env
const {Recipes, Diets} = require('../db');
const { Sequelize } = require('sequelize');


const getRecipeByName = async (req, res) => {

        try {
            const {name} = req.query

            if(!name){
                throw new Error(`No existe la receta con nombre ${name}`)              
            }

            const {data} = await axios(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`);

            const apiRecipes = data.results.filter(coincidende => coincidende.title.toLowerCase().includes(name.toLowerCase())).map(recipe => {
                const instructions = recipe.analyzedInstruction && recipe.analyzedInstruction[0] ? recipe.analyzedInstructions[0].steps.map(step => step.step) : [];
                const diets = recipe.diets || recipe.Diets.map(diet => diet.name);
                return{
                    id: recipe.id,
                    name:recipe.title,
                    image: recipe.image,
                    summary:recipe.summary.replace(/<[^>]*>/g, ''),
                    healthScore:recipe.healthScore,
                    steps: instructions,
                    diets,
                    created: false
                }
            });

            const dbRecipes = await Recipes.findAll({
                attributes: ['id', 'name', 'image', 'summary', 'healthScore', 'steps', 'created'],
                include: {model: Diets, attributes: ['name']}
            });

            console.log(dbRecipes)

            const dbRecipesAll = dbRecipes.map(recipe => {
                const diets = recipe.diets || recipe.Diets.map(diet => diet.name);
                return {
                    id: recipe.id,
                    name: recipe.name,
                    image: recipe.image,
                    summary: recipe.summary,
                    healthScore:recipe.healthScore,
                    steps:recipe.steps,
                    diets,
                    created: true
                }
            });

            const allRecipes = apiRecipes.concat(dbRecipesAll);

            if(allRecipes.length === 0){
                return res.status(400).send(`No hay recetas con el nombre: ${name}`)
            };

            return res.status(200).json(allRecipes)

        } catch (error) {
            
            res.status(500).json({error: error.message})
        }
}

module.exports = getRecipeByName