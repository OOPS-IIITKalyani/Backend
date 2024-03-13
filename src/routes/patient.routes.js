const express = require('express');

const {
    registerPatient,
    loginPatient,
    logoutPatient,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentPatient,
    updateAccountDetails,
} = require('../controllers/patient.controller.js');

const { verifyJWT } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', loginPatient);

//secure routes
router.post('/logout', verifyJWT, logoutPatient);
router.post('/refreshAccessToken', refreshAccessToken);
router.post('/changeCurrentPassword', verifyJWT, changeCurrentPassword);
router.get('/getCurrentPatient', verifyJWT, getCurrentPatient);
router.patch('/updateAccountDetails', verifyJWT, updateAccountDetails);

module.exports = router;