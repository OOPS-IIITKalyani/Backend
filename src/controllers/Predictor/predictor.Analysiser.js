const fs = require('fs');

function analyzeUserSymptoms(userSymptoms, age) {
    let filePath;

    if (age === 0) {
        filePath = "data/upto2months.json";
    } else if (age === 1) {
        filePath = "data/2monthsTo5Years.json";
    } else {
        filePath = "data/data.json";
    }

    try {
        // Read the JSON file
        let data = fs.readFileSync(filePath);
        let diseases = JSON.parse(data);

        // Initialize disease scores map
        let diseaseScores = {};

        // Iterate through diseases
        diseases.forEach(disease => {
            let diseaseName = disease.Disease;
            let precaution = disease.Precaution;
            let diseaseSymptoms = disease.Symptoms;

            let output = matchSymptoms(diseaseName, diseaseSymptoms, userSymptoms);

            if (output.probability > 0) {
                diseaseScores[output.diseaseName] = [output.probability, precaution, diseaseSymptoms];
            }
        });

        // If no matches found and age is over 5
        if (Object.keys(diseaseScores).length === 0 && age > 5) {
            return { message: "No dataset found" };
        }

        // Sort disease scores by probability
        let sortedScores = Object.entries(diseaseScores)
            .sort((a, b) => b[1][0] - a[1][0])
            .slice(0, 7); // Take top 7 diseases

        return Object.fromEntries(sortedScores);
    } catch (error) {
        throw new Error(`Error analyzing user symptoms: ${error.message}`);
    }
}

function matchSymptoms(diseaseName, diseaseSymptoms, userSymptoms) {
    let matchCount = 0;

    diseaseSymptoms.forEach(symptom => {
        if (userSymptoms.includes(symptom)) {
            matchCount++;
        }
    });

    let probability = (matchCount / diseaseSymptoms.length) * 100;

    return {
        diseaseName: diseaseName,
        probability: probability,
    };
}

// Example usage:
let userSymptoms = ["Fever", "Cough", "Headache"];
let age = 10;

try {
    let result = analyzeUserSymptoms(userSymptoms, age);
    console.log(result);
} catch (error) {
    console.error(error.message);
}
