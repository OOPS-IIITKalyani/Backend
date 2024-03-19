const express = require('express');
const { predictDisease2 } = require('../controllers/predictor2.controller.js');
const { verifyJWT } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.post('/', predictDisease2);

module.exports = router;
