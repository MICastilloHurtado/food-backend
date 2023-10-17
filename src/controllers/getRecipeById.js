const axios = require('axios')
require('dotenv').config();
const {API_KEY} = process.env
const {Recipes, Diets} = require('../db')


const getRecipeById =  async (req, res) => {
   
   try {

      const {id} = req.params;

      //si el ID incluye '-' es de la base de datos y lo busco allí
      if(id.toString().includes("-")){
         const searchDatabaseRecipe = await Recipes.findOne( {where: { id: id },
            include: { model: Diets, attributes: ['name']} },
        )
        
        if(!searchDatabaseRecipe)throw new Error(`No hay recetas con el id ${id}`);
        
        
        return res.status(200).json(searchDatabaseRecipe);
      };
         
      const {data} = await axios(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=true`);


      if(!data)return res.status(400).send(`No hay recetas con el id ${id}`)

      const filteredRecipes = data

      const deleteTags = filteredRecipes.summary.replace(/<[^>]*>/g, '');

      const stepsBystep = data.analyzedInstructions[0].steps.map(step => step.step)

      const associatedDiet = {
         id: filteredRecipes.id,
         name: filteredRecipes.title,
         image: filteredRecipes.image,
         summary: deleteTags,
         healthScore: filteredRecipes.healthScore,
         step: stepsBystep,
         diets: filteredRecipes.diets,
         created: false
         
      }

      return res.status(200).json(associatedDiet);


      
   } catch (error) {
      
      return res.status(404).json({error: error.message})
   }

}

module.exports = getRecipeById