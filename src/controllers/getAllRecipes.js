const axios = require('axios')
require('dotenv').config()
const { Diets, Recipes} = require('../db')
const {API_KEY} = process.env


const getAllRecipes = async (req, res) =>{

    try {
        
        const {data} = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`)
    
        const apiRecipes = data.results.map(recipe => {
            const instructions = recipe.analyzedInstructions && recipe.analyzedInstructions[0] ? recipe.analyzedInstructions[0].steps.map(step => step.step) : [];
            const diets = recipe.diets || recipe.Diets.map(diet => diet.name);
            return{
                id:recipe.id,
                name: recipe.title,
                image: recipe.image,
                summary: recipe.summary.replace(/<[^>]*>/g, ''),
                healthScore: recipe.healthScore,
                steps: instructions,
                diets,
                created: false
            }
    
        });
        
        const dbRecipes = await Recipes.findAll({
            attributes: ['id', 'name', 'image', 'summary', 'healthScore', 'steps', 'created'],
            include: {model:Diets, attributes:['name']}
        })
        const dbRecipesAll = dbRecipes.map(recipe => {
            const diets = recipe.diets || recipe.Diets.map(diet => diet.name);
            return{
                id: recipe.id,
                name: recipe.name,
                image:recipe.image,
                summary:recipe.summary,
                healthScore:recipe.healthScore,
                steps: recipe.steps,
                diets,
                created: true
            }
        });
    
        const allRecipes = [...apiRecipes, ...dbRecipesAll];
    
        if(allRecipes.length === 0){
            return res.status(400).send('No hay recetas')
        }
    
        return res.status(200).json(allRecipes)

    } catch (error) {
        
        return res.status(404).json({error: error.message})
    }

};

module.exports = getAllRecipes
