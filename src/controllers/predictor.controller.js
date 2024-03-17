const asyncHandler= require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
  
const fs = require('fs');
const csv = require('csv-parser'); // You need to install this package
const readline = require('readline');

function loadCSVFile(filePath) {
    const data = [];
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
        });
    return data;
}
//no need for asyncHandler??
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
//   // Example usage:
//   const jsonInput = `
//   [
//     {
//       "name": "kin_rash",
//       "description": "blablabla",
//       "severity": 2,
//       "duration": "Temporary"
//     },
//     {
//       "name": "itching",
//       "description": "blablabla",
//       "severity": 3,
//       "duration": "Permanent"
//     }
//   ]
//   `;
  
//   const namesArray = extractNamesFromJSON(jsonInput);
//   console.log(namesArray);
  
  function jsonToHashMap(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(data);
        const hashMap = {};

        for (const key in json) {
            hashMap[key.trim()] = json[key];
        }

        return hashMap;
    } catch (error) {
        console.error('Error reading JSON file:', error.message);
        return {};
    }
}
const hashMap = jsonToHashMap('../../data/symptom_disease.json');

async function csvHeaderToMap(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineNumber = 0;
    let headerMap = new Map();

    for await (const line of rl) {
        // Only process the first line
        if (lineNumber === 0) {
            const headers = line.split(',');
            headers.forEach((header, index) => {
                headerMap.set(header.trim(), index);
            });
        }
        lineNumber++;
    }

    return headerMap;
}


async function findSerialNumberForHeader(filePath) {
    const headerMap = await csvHeaderToMap(filePath);
    if (!headerMap) {
        throw new Error('Failed to create header map');
    }
    return headerMap;
}

async function processArray(filePath, array) {
    const headerMap = await findSerialNumberForHeader(filePath);
    let result = new Array(52).fill(0);
    for (let i = 0; i < array.length; i++) {
        let serial = headerMap.get(array[i]);
        if (serial !== undefined) {
            result[serial - 1] = 1;
        }
    }
    return result;
}

// Usage
processArray('../../data/dataset.csv', ['itching', 'skin_rash'])
    .then(result => console.log(result))
    .catch(err => console.error(err));

//findSerialNumberForHeader('../../data/dataset.csv', 'itching')
