const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const report = new Schema({
  symptoms: {
    type: [String],
    required: true
  },
  prediction: {
    type: Map,
    of: [String]
  },
  dateOfDiagnosis: {
    type: Date,
    required: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  comments: {
    type: String
  }
});

// Create the model
const Report = mongoose.model('Report', report);

module.exports = Report;
