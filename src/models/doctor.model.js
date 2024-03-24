const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const doctorSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        licenseExpiryDate: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        organization: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

doctorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

doctorSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

doctorSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            phoneNumber: this.phoneNumber,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

doctorSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

module.exports = mongoose.model('Doctor', doctorSchema);