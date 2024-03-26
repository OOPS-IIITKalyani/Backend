const express = require('express');
const { addReport, getReports, getReport } = require('../controllers/Report.controller.js');

const router = express.Router();

router.route('/')
.post(addReport)
.get(getReports);
router.route('/:id').get(getReport);

module.exports = router;