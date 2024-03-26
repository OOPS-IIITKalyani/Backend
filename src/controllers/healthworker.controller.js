const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Healthworker = require("../models/healthworker.model");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");

const generateAccessAndRefreshTokens = async (healthworkerId) => {
    try{
    const doctor = await Healthworker.findById(healthworkerId);
    const accessToken = doctor.generateAccessToken();
    const refreshToken = doctor.generateRefreshToken();

    doctor.refreshToken = refreshToken;
    await doctor.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
    
}

const registerHealthworker = asyncHandler(async (req, res) => {
    const { name, graduationDate, organization, phoneNumber, password } = req.body;

    // Validation - Check for missing fields
    const requiredFields = ['name', 'graduationDate', 'organization', 'phoneNumber', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === "");
    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check if healthworker already exists
    const existedHealthworker = await Healthworker.findOne({
        $or: [{ name }, { phoneNumber }]
    });
    if (existedHealthworker) {
        throw new ApiError(409, "Healthworker with phone number or name already exists");
    }

    // Create healthworker object
    const healthworker = await Healthworker.create({
        name,
        graduationDate,
        organization,
        phoneNumber,
        password,
    });

    // Remove sensitive fields from response
    const createdHealthworker = await Healthworker.findById(healthworker._id).select("-password -refreshToken");

    if (!createdHealthworker) {
        throw new ApiError(500, "Something went wrong while registering the Healthworker");
    }

    return res.status(201).json(new ApiResponse(200, createdHealthworker, "Healthworker registered successfully"));
});

const loginHealthworker = asyncHandler(async (req, res) => {
    const { name, password } = req.body;

    // Validation - Check for missing fields
    const requiredFields = ['name', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === "");
    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check if healthworker exists
    const healthworker = await Healthworker.findOne({ name });
    if (!healthworker) {
        throw new ApiError(404, "Healthworker not found");
    }

    // Check if password is correct
    const isPasswordCorrect = await healthworker.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(healthworker._id);

    return res.status(200).json(new ApiResponse(200, { accessToken, refreshToken }, "Login successful"));
});

module.exports = {
    registerHealthworker,
    loginHealthworker
};