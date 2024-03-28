const { analyzeUserSymptoms } = require('../controllers/Predictor/predictor.Analysiser');
const asyncHandler = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const Patient = require("../models/patient.model")
const { addReport } = require('../controllers/Report.controller');
const Report = require("../models/Report.model")

const Predictor = asyncHandler(async (req, res,) => {
    try {
        const { userSymptoms, age, patientData } = req.body;
        console.log(req.body);
        const { name, gender, phoneNumber } = patientData;
        console.log(phoneNumber);
        const dateOfDiagnosis = new Date().toISOString();

        // Check if patient already exists
        let patient = await Patient.findOne({phoneNumber}).then((result) => console.log(result));
        console.log(patient);
        console.log(!patient);
        if (!patient) {
            console.log("Creating new patient");
            const newPatient = await Patient.create({ name, gender, phoneNumber })
            patient = await Patient.findById(newPatient._id).select(
                "-password -refreshToken"
            )
            if (!patient) {
                throw new ApiError(500, "Something went wrong while registering the Patient")
            }
            console.log(patient);
        }
        console.log(patientData);
        console.log(userSymptoms);
        if (!userSymptoms || !age) {
            throw new ApiError(400, 'User symptoms and age are required');
        }
        const result = analyzeUserSymptoms(userSymptoms, age);
        console.log(result);
        if (!result) {
            throw new ApiError(500, "Something went wrong while analyzing user symptoms")
        }
        const patientId = patient._id;
        const report = await Report.create({
            symptoms: userSymptoms,
            prediction: result,
            dateOfDiagnosis,
            patientId
        });

        // Remove sensitive fields from response
        let createdReport = await Report.findById(report._id).select("-password -refreshToken");

        if (!createdReport) {
            throw new ApiError(500, "Something went wrong while adding the report");
        }
        console.log(createdReport);

        res.status(200).json(result);
    } catch (error) {
        throw new ApiError(500, error.message)
    }
});

module.exports = Predictor;

module.exports = { Predictor };