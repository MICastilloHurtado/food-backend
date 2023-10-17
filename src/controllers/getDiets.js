const {Recipes, Diets} = require("../db");
const axios = require("axios");
require('dotenv').config();
const {API_KEY} = process.env;

const clean = (arr) => {
    return arr.map((e) => {
      return {
        diets: e.diets.map((diet) => diet.trim().replace(/-+$/, "")),
      };
    });
  };

const getDiets =  async (req, res) => {
    
    try {
        let dietsApi = [];
        let dietsDbAll = [];
        let diets = await Diets.findAll();
        let dietsDb = await Recipes.findAll({
            include: {
                model: Diets,
                attributes: ['id', 'name'],
                through: { attributes: []}
            }
        })

        

        if(diets.length === 0){

            const {data} = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`)
        
            let idCounter = 0;
            dietsApi = [...new Set(data.results.flatMap((diet) => diet.diets))]
            .map((diet) => ({ id: idCounter++, diet, api: true}));

            diets =  [...new Set(data.results.map((result) => result.diets).flat())];

            await Promise.all(
                diets.map( async (diet) => {
                    await Diets.create({name : diet})
                })
            );
            diets = await Diets.findAll()
            
        }
        else{
            const { data } = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`)
            let idCounter = 0;
            dietsApi = [...new Set(data.results.flatMap((diet) => diet.diets))]
            .map((diet) => ({id: idCounter++, diet, api:true}));
            diets = await Diets.findAll()

        }
        const combinedDiets = [...diets];

        return res.status(200).json(combinedDiets);

    } catch (error) {
        
        return res.status(500).json({error: error.message})
        
    }
}

module.exports = getDiets