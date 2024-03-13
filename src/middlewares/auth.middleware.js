const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const  asyncHandler  = require("../utils/asyncHandler");
const  Patient  = require("../models/patient.model");


 const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(300, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const patient = await Patient.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!patient) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.patient = patient;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})

module.exports = { verifyJWT }