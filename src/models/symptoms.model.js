const mongoose = require('mongoose');


const symptomsModelSchema = new mongoose.Schema({
    symptoms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Symptom' // Reference to the Symptom model
      }],

});

const SymptomsModel = mongoose.model('SymptomsModel', symptomsModelSchema);

module.exports = SymptomsModel;

