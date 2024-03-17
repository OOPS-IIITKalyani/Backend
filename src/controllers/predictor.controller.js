const asyncHandler= require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")

function extractNamesFromJSON(jsonInput) {
    try {
      const parsedInput = JSON.parse(jsonInput);
      if (!Array.isArray(parsedInput)) {
        throw new ApiError('Input is not an array');
      }
      const namesArray = parsedInput.map(item => item.name);
      return namesArray;
    } catch (error) {
      console.error('Error processing JSON input:', error.message);
      return [];
    }
  }
  
  // Example usage:
  const jsonInput = `
  [
    {
      "name": "kin_rash",
      "description": "blablabla",
      "severity": 2,
      "duration": "Temporary"
    },
    {
      "name": "itching",
      "description": "blablabla",
      "severity": 3,
      "duration": "Permanent"
    }
  ]
  
  `;
  
  const namesArray = extractNamesFromJSON(jsonInput);
  console.log(namesArray); // Output: ["Error 404", "Database Connection Error", "Authentication Failure"]
  