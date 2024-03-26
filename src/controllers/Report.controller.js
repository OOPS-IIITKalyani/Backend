const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");

const Report = require("../models/Report.model");


const addReport = asyncHandler(async (req, res) => {
    const { DiseaseName, Symptoms, DateOfdiagnose, Doctor, Patient, medicines, Comments } = req.body;

    // Validation - Check for missing fields
    const requiredFields = ['DiseaseName', 'Symptoms', 'DateOfdiagnose', 'Doctor', 'Patient', 'medicines'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === "");
    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
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

    return res.status(201).json(new ApiResponse(200, createdReport, "Report added successfully"));
} );