const {Recipes, Diets} = require('../db')

const postRecipe = async (req, res) => {
   
    try {
        
        const {name, image, summary, healthScore, steps, diets} = req.body;

        if(!name || !image || !summary || !healthScore || !steps || !diets){
            return res.status(400).send('Faltan datos por completar');
        }

        const existinRecipe = await Recipes.findOne({where:{name}});

        if(existinRecipe){
            return res.status(400).send(`Ya existe la receta con el nombre ${name}`)
        };

        const createRecipe = await Recipes.create({name, image, summary, healthScore, steps});

        const dietsArray = diets;
        
        const dietInstance = await Diets.findOrCreate({where:{name:dietsArray } });

        await createRecipe.addDiets(dietInstance[0])    
        

        const response = {
            id: createRecipe.id,
            name: createRecipe.name,
            image: createRecipe.image,
            summary: createRecipe.summary,
            healthScore: createRecipe.healthScore,
            steps: createRecipe.steps,
            diets: diets,
            created: true
        };

        return res.status(201).json(response)

    } catch (error) {

        res.status(500).json({error: error.message})
        
    }
};

module.exports = postRecipe