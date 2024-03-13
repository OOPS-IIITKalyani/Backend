// Desc: Healthcheck controller
const ApiResponse = require("../utils/ApiResponse.js")
const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/ApiError.js")

const healthcheck = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Server is healthy!!"));
})

module.exports = {
    healthcheck
}
    