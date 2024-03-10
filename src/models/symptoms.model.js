const mongoose = require('mongoose');


const symptomsModelSchema = new mongoose.Schema({
    symptoms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Symptom' // Reference to the Symptom model
      }],
  // Add other fields related to the symptoms model
});

// Create a Mongoose model based on the schema
const SymptomsModel = mongoose.model('SymptomsModel', symptomsModelSchema);

module.exports = SymptomsModel;

