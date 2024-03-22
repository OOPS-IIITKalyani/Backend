const fs = require('fs');

async function updateOptions(newOption) {
    const filePath = 'src/main/resources/static/dataOptions.json';

    try {
        // Read the JSON file
        let data = fs.readFileSync(filePath);
        let jsonData = JSON.parse(data);

        // Ensure the JSON structure is as expected
        if (!jsonData || !jsonData.options || !Array.isArray(jsonData.options)) {
            throw new Error('options.json does not have the expected structure.');
        }

        // Add new option to the options array
        jsonData.options.push(newOption);

        // Write updated data back to the file
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    } catch (error) {
        throw new Error(`Error updating options.json: ${error.message}`);
    }
}

module.exports = {
    updateOptions
}