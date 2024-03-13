const mongoose =require('mongoose');
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const DateOfBirthSchema = new Schema({
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 31
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  });
  
  // Virtual to calculate age from date of birth
  DateOfBirthSchema.virtual("age").get(function () {
    // Get current date
    const currentDate = new Date();
  
    const dob = new Date(this.year, this.month - 1, this.day);
  
    // Calculate age
    let age = currentDate.getFullYear() - dob.getFullYear();
    const dobMonth = dob.getMonth();
    const currentMonth = currentDate.getMonth();
  
    if (currentMonth < dobMonth || (currentMonth === dobMonth && currentDate.getDate() < dob.getDate())) {
      age--;
    }
  
    return age;
  });

const patientSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true, 
            unique: true,
        },
        PhoneNumber: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
            index: true
        },
        dateOfBirth: DateOfBirthSchema,
        exisitingConditions: {
            type: [String],
            required: false,
            lowercase: true,
            trim: true,
        },
        healthReports: {
            //for now we assume that the health report is a string(url)
            type: [String],
            required: false,
            lowercase: true,
            trim: true,
        },
        Genser:{
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        lastDaigonised:{
            type: Date            
        },
        location:{
            //string for now,later might add coordinates
            type: String,
            required: false,
            lowercase: true,
            trim: true,
        },
        symptoms: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Symptom'

        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

patientSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

patientSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

patientSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            PhoneNumber: this.PhoneNumber,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
patientSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
module.exports = mongoose.model("Patient", patientSchema);
// Path: src/models/doctor.model.js
