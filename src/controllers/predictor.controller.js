const asyncHandler= require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
  
const fs = require('fs');
const csv = require('csv-parser');
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
function countMatches(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        throw new Error('Both arrays should have the same length');
    }

    let matches = 0;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] === arr2[i]) {
            matches++;
        }
    }

    return matches;
}
//   // Example usage:
//   const jsonInput = `
//   [
//     {
//       "name": "skin_rash",
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
  
async function jsonToHashMap(filePath) {
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
            // console.log('Headers:', headers);
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
    //remeber to change this according to the number of symptoms
    let result = new Array(51).fill(0);
    for (let i = 0; i < array.length; i++) {
        let serial = headerMap.get(array[i]);
        if (serial !== undefined) {
            result[serial - 1] = 1;
        }
    }
    return result;
}

// processArray('../../data/dataset.csv', ['itching', 'skin_rash'])
//     .then(result => console.log('array processed'))
//     .catch(err => console.error(err));

//findSerialNumberForHeader('../../data/dataset.csv', 'itching')
async function loadCSVFile(filePath, vectorToCompare) {
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let data = [];
    let scores=[];
    let diseases = [];
    let isFirstLine = true;

    rl.on('line', (line) => {
        if (isFirstLine) {
            isFirstLine = false;
        } else {
            const row = line.split(',');
            const firstElement = row.shift();
            diseases.push(firstElement); 
            const numbers = row.map(element => parseFloat(element));
            data.push(numbers);
        }
    });
    rl.on('close', () => {
        data.forEach(row => {
            scores.push(countMatches(row, vectorToCompare));
        });
        // console.log('diseases', diseases);
        // console.log('data', data);
        callback(scores);
        console.log('scores', scores);
    });

    rl.on('error', (err) => {
        reject(err);
    });

}

loadCSVFile('../../data/dataset.csv', [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]).then(result => console.log('csvfilestuff',result)).catch(err => console.error(err));
