const mongoose = require('mongoose');
const { Schema } = mongoose;


const symptomSchema = new mongoose.Schema({
  //to ask about the entry into the database if there is a 
    name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  // You can add more fields as needed
});

// Create a Mongoose model based on the schema
const Symptom = mongoose.model('Symptom', symptomSchema);

module.exports = Symptom;
