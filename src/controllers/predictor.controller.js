const { analyzeUserSymptoms} = require('../controllers/Predictor/predictor.Analysiser');
const asyncHandler= require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")


const Predictor = asyncHandler(async (req, res,) => {
    try {
        const { userSymptoms, age } = req.body;

        if (!userSymptoms || !age) {
            throw new ApiError(400,'User symptoms and age are required');
        }
        const result = analyzeUserSymptoms(userSymptoms, age);
        
        res.status(200).json(result);
    } catch (error) {
        throw new ApiError(500, "Something went wrong while analyzing user symptoms")
    }
});

module.exports = Predictor;

module.exports = { Predictor };