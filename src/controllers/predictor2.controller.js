const asyncHandler= require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
const fs = require('fs');
const csv = require('csv-parser');
const readline = require('readline');

function fileExists(filePath) {
    return fs.existsSync(filePath);
}

function directoryExists(directoryPath) {
    return fs.existsSync(directoryPath) && fs.lstatSync(directoryPath).isDirectory();
}
const {
    processArray,
    jsonToHashMap2,
    extractNamesFromJSON,
    countMatches,
    loadCSVFile,
    findSerialNumberForHeader,
    csvHeaderToMap,
    getTopDiseases,
    CSVFileFinale
}=require("./predictorHelper.controller");

const predictDisease2 = asyncHandler(async (req, res) => {
    const { symptoms } = req.body;
    if (!symptoms) {
        return next(new ApiError(400, "Symptoms are required"));
    }
    const filePath = 'data/dataset.csv';
    const result = await CSVFileFinale(filePath, symptoms);
    return res.status(200).json({
        status: 'success',
        data: result
    });
});

module.exports = {
    predictDisease2
}