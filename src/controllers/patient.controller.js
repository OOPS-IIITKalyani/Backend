const asyncHandler= require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
const  Patient  = require("../models/patient.model")
const ApiResponse = require("../utils/ApiResponse")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")


const generateAccessAndRefereshTokens = async(patientId) =>{
    try {
        const patient = await Patient.findById(patientId)
        const accessToken = patient.generateAccessToken()
        const refreshToken = patient.generateRefreshToken()

        patient.refreshToken = refreshToken
        await patient.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerPatient = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res



const { name, PhoneNumber, Genser, password } = req.body;
console.log("Received request body:", req.body);
const requiredFields = ['name', 'PhoneNumber', 'Genser', 'password'];
const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === "");
console.log(missingFields);
if (missingFields.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
}

// Now you can proceed with creating the Patient


    
    const existedPatient = await Patient.findOne({
        $or: [{ name }, { PhoneNumber }]
    })
    
    if (existedPatient) {
        throw new ApiError(409, "Patient with PhoneNumber or name already exists")
    }
    //console.log(req.files);

   
   
    const patient = await Patient.create({
        name,
        PhoneNumber,
        Genser,
        password,
    })

    const createdPatient = await Patient.findById(patient._id).select(
        "-password -refreshToken"
    )

    if (!createdPatient) {
        throw new ApiError(500, "Something went wrong while registering the Patient")
    }

    return res.status(201).json(
        new ApiResponse(200, createdPatient, "Patient registered Successfully")
    )

} )

const loginPatient = asyncHandler(async (req, res) =>{
    // req body -> data
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {name,PhoneNumber,password} = req.body
   

    if (!name || !PhoneNumber) {
        throw new ApiError(400, "name or email is required")
    }

    const patient = await Patient.findOne({
        $or: [{name}, {PhoneNumber}]
    })

    if (!patient) {
        throw new ApiError(404, "Patient does not exist")
    }

   const isPasswordValid = await patient.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Patient credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(patient._id)

    const loggedInPatient = await Patient.findById(patient._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                patient: loggedInPatient, accessToken, refreshToken
            },
            " logged In Successfully"
        )
    )

})

const logoutPatient = asyncHandler(async(req, res) => {
    await Patient.findByIdAndUpdate(
        req.patient._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Patient logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const patient = await Patient.findById(decodedToken?._id)
    
        if (!patient) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== patient?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(patient._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const patient= await Patient.findById(req.patient?._id)
    const isPasswordCorrect = await patient.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    patient.password = newPassword
    await patient.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentPatient = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.patient,
        "patient fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {name, PhoneNumber} = req.body

    if (!name || !PhoneNumber) {
        throw new ApiError(400, "All fields are required")
    }

    const patient = await Patient.findByIdAndUpdate(
        req.patient?._id,
        {
            $set: {
                name,
                PhoneNumber: PhoneNumber
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, patient, "Account details updated successfully"))
});

module.exports = {
    registerPatient,
    loginPatient,
    logoutPatient,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentPatient,
    updateAccountDetails,
}
