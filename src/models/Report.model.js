const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const report= new Schema({
  DiseaseName: {
    type: String,
    required: true
  },
  Symptoms: {
    type: [String],
    required: true
  },
  DateOfdiagnose: {
    type: Date,
    required: true
  },
  Doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  Patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  medicines: {
    type: [String],
    required: true
  },
  Comments: {
    type: String
  }
});

// Create the model
const Report= mongoose.model('Report', report);

module.exports = Report;
