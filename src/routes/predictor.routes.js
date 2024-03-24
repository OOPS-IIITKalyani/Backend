const express = require('express');

const { Predictor} = require('../controllers/predictor.controller.js')

const router = express.Router();

router.post('/analyze', Predictor);

module.exports = router;