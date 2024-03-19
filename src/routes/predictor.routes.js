const express = require('express');
const { predictDisease } = require('../controllers/predictor.controller.js');
const { verifyJWT } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.post('/', predictDisease);

module.exports = router;
