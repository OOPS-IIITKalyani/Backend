const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const healthWorkerSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        graduationDate: {
            type: Date,
            required: true,
        },
        organization: {
            type: String,
            required: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

healthWorkerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

healthWorkerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

healthWorkerSchema.methods.generateAccessToken = function () {
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

healthWorkerSchema.methods.generateRefreshToken = function () {
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

module.exports = mongoose.model('HealthWorker', healthWorkerSchema);