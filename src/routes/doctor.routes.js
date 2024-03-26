const express = require('express');

const {
    registerDoctor,
    loginDoctor,
    logoutDoctor,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentDoctor,
    updateAccountDetails,
} = require('../controllers/doctor.controller.js');

const { verifyJWT } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);

//secure routes
router.post('/logout', verifyJWT, logoutDoctor);
router.post('/refreshAccessToken', refreshAccessToken);
router.post('/changeCurrentPassword', verifyJWT, changeCurrentPassword);
router.get('/getCurrentDoctor', verifyJWT, getCurrentDoctor);
router.patch('/updateAccountDetails', verifyJWT, updateAccountDetails);

module.exports = router;