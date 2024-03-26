const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");

const Report = require("../models/Report.model");
const Patientmod = require("../models/patient.model");
const Doctormod = require("../models/doctor.model");

const addReport = asyncHandler(async (req, res) => {
    const { DiseaseName, Symptoms, DateOfdiagnose, Doctor, Patient, medicines, Comments } = req.body;
    const requiredFields = ['DiseaseName', 'Symptoms', 'DateOfdiagnose', 'Doctor', 'Patient', 'medicines'];
    const missingFields = requiredFields.filter(field => {
        if (!req.body[field]) return true; // Field is missing
        if (typeof req.body[field] !== 'string') return true; // Field is not a string
        if (req.body[field].trim() === '') return true; // Field is empty after trimming
        return false; // Field is present and valid
    });
    
    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing or invalid required fields: ${missingFields.join(', ')}`);
    }
    
    // Create report object
    const report = await Report.create({
        DiseaseName,
        Symptoms,
        DateOfdiagnose,
        Doctor,
        Patient,
        medicines,
        Comments
    });

    // Remove sensitive fields from response
    const createdReport = await Report.findById(report._id).select("-password -refreshToken");

    if (!createdReport) {
        throw new ApiError(500, "Something went wrong while adding the report");
    }
    const patientId = createdReport.Patient;
    const doctorId = createdReport.Doctor;
    const patientinfo = await Patientmod.findById(patientId).select(
        "-password -refreshToken"
    );

    const doctorinfo = await Doctormod.findById(doctorId).select(
        "-password -refreshToken"
    );
    if (!patientinfo || !doctorinfo) {
        throw new ApiError(404, "Patient or Doctor not found");
    }
    return res.status(201).json(new ApiResponse(200, {createdReport,
        patientInfo: patientinfo,
    doctorInfo: doctorinfo
    }, "Report added successfully"));
} );

const getReports = asyncHandler(async (req, res) => {
    const reports = await Report.find();
    res.status(200).json(new ApiResponse(200, reports, "Reports fetched successfully"));
} );

const getReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) {
        throw new ApiError(404, "Report not found");
    }
    res.status(200).json(new ApiResponse(200, report, "Report fetched successfully"));
});

module.exports = {  addReport, getReports, getReport };