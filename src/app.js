const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const app = express()

app.use(cors({
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import

const patientrouter = require("./routes/patient.routes.js")
const healthcheckRouter = require("./routes/healthcheck.routes.js")
const predictionRouter = require("./routes/predictor.routes.js")
const doctorRouter = require("./routes/doctor.routes.js")
const Healthworker = require("./models/healthworker.model.js")

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", patientrouter)
app.use("/api/v1/predictor", predictionRouter)
app.use("/api/v1/doctors", doctorRouter)
app.use("/api/v1/healthworkers", Healthworker)


// http://localhost:8000/api/v1/users/register

module.exports = app