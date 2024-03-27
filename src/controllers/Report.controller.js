const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");

const Report = require("../models/Report.model");
const Patientmod = require("../models/patient.model");
const Doctormod = require("../models/doctor.model");

const addReport = asyncHandler(async (symptoms, prediction, dateOfDiagnosis, patientId) => {
    const report = await Report.create({
        symptoms,
        prediction,
        dateOfDiagnosis,
        patientId,
    });

    // Remove sensitive fields from response
    const createdReport = await Report.findById(report._id).select("-password -refreshToken");

    if (!createdReport) {
        throw new ApiError(500, "Something went wrong while adding the report");
    }

    return createdReport;
});

const getReports = asyncHandler(async (req, res) => {
    const reports = await Report.find().populate('patientId doctor');
    res.status(200).json(new ApiResponse(200, reports, "Reports fetched successfully"));
});

const getReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) {
        throw new ApiError(404, "Report not found");
    }
    res.status(200).json(new ApiResponse(200, report, "Report fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const { comments, doctorId, reportId } = req.body;
    const report = await Report.findByIdAndUpdate(reportId, { comments, doctor: doctorId }, { new: true });
    if (!report) {
        throw new ApiError(404, "Report not found");
    }
    res.status(200).json(new ApiResponse(200, report, "Comment added successfully"));
});

module.exports = { addReport, getReports, getReport, addComment };