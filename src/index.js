const express = require('express')
const connectDB = require('./db/index.js')
const app = require('./app.js')
require('dotenv').config({path:'../.env'});
console.log(process.env)
const port = process.env.PORT ||8000

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(` Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

