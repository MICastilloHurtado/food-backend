const { Router } = require('express');
const getRecipeByName = require('../controllers/getRecipeByName')
const postRecipe = require('../controllers/postRecipe')
const getRecipeById = require('../controllers/getRecipeById')
const getDiets = require('../controllers/getDiets')
const getAllRecipes = require('../controllers/getAllRecipes')
const router = Router();


//Buscar recetas por ID
router.get('/recipes/:id', getRecipeById);

// Buscar todas las recetas
router.get('/recipes', getAllRecipes)

//Buscar las recetas por name
router.get('/recipesName', getRecipeByName);


//Postear una receta
router.post('/recipes', postRecipe);

//buscar dietas
router.get('/diets', getDiets)



module.exports = router;
