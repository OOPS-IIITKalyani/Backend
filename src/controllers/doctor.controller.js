const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Doctor = require("../models/doctor.model");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");

const generateAccessAndRefreshTokens = async (doctorId) => {
    try {
        const doctor = await Doctor.findById(doctorId);
        const accessToken = doctor.generateAccessToken();
        const refreshToken = doctor.generateRefreshToken();

        doctor.refreshToken = refreshToken;
        await doctor.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

const registerDoctor = asyncHandler(async (req, res) => {
    const { name, licenseExpiryDate, gender, phoneNumber, organization, password } = req.body;
    const requiredFields = ['name', 'licenseExpiryDate', 'gender', 'phoneNumber', 'organization', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === "");

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    const existedDoctor = await Doctor.findOne({
        $or: [{ name }, { phoneNumber }]
    });

    if (existedDoctor) {
        throw new ApiError(409, "Doctor with phone number or name already exists");
    }

    const doctor = await Doctor.create({
        name,
        licenseExpiryDate,
        gender,
        phoneNumber,
        organization,
        password,
    });

    const createdDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken");

    if (!createdDoctor) {
        throw new ApiError(500, "Something went wrong while registering the Doctor");
    }

    return res.status(201).json(new ApiResponse(200, createdDoctor, "Doctor registered successfully"));
});

const loginDoctor = asyncHandler(async (req, res) => {
    const { name, phoneNumber, password } = req.body;

    if (!name || !phoneNumber) {
        throw new ApiError(400, "name or phone number is required");
    }

    const doctor = await Doctor.findOne({
        $or: [{ name }, { phoneNumber }]
    });

    if (!doctor) {
        throw new ApiError(404, "Doctor does not exist");
    }

    const isPasswordValid = await doctor.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Doctor credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(doctor._id);

    const loggedInDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    doctor: loggedInDoctor, accessToken, refreshToken
                },
                "Logged in successfully"
            )
        );
});

const logoutDoctor = asyncHandler(async (req, res) => {
    await Doctor.findByIdAndUpdate(
        req.doctor._id,
        {
            $unset: {
                refreshToken: 1 // This removes the field from the document
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Doctor logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const doctor = await Doctor.findById(decodedToken?._id);

        if (!doctor) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== doctor?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(doctor._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const doctor = await Doctor.findById(req.doctor?._id);
    const isPasswordCorrect = await doctor.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    doctor.password = newPassword;
    await doctor.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentDoctor = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.doctor,
            "Doctor fetched successfully"
        ));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, phoneNumber } = req.body;

    if (!name || !phoneNumber) {
        throw new ApiError(400, "All fields are required");
    }

    const doctor = await Doctor.findByIdAndUpdate(
        req.doctor?._id,
        {
            $set: {
                name,
                phoneNumber
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, doctor, "Account details updated successfully"));
});

module.exports = {
    registerDoctor,
    loginDoctor,
    logoutDoctor,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentDoctor,
    updateAccountDetails,
};