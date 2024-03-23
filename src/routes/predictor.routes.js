const express = require('express');

const { Predictor} = require('/Users/tamaghnachoudhuri/Desktop/Webcode/Backend/src/controllers/predictor.controller.js')

const router = express.Router();

router.post('/analyze', Predictor);

module.exports = router;