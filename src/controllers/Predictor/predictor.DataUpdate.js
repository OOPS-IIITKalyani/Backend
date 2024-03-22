const fs = require('fs');

function updateData(newDisease) {
    const filePath = 'data/data.json';

    try {
        // Read the JSON file
        let data = fs.readFileSync(filePath);
        let diseases = JSON.parse(data);

        // Convert new disease object to JSON string
        let newJsonNode = JSON.stringify(newDisease);

        // Add new disease to array
        diseases.push(JSON.parse(newJsonNode));

        // Write updated data back to file
        fs.writeFileSync(filePath, JSON.stringify(diseases, null, 2));
    } catch (error) {
        throw new Error(`Error updating data.json: ${error.message}`);
    }
}

module.exports = {
    updateData
} 