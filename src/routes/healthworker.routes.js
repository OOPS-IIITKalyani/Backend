const express = require('express');

const {
    registerHealthworker,
    loginHealthworker,
}= require('../controllers/healthworker.controller.js');

const { verifyJWT } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.post('/register', registerHealthworker);
router.post('/login', loginHealthworker);

module.exports = router;