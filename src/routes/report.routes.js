const express = require('express');
const { addReport, getReports, getReport, addComment} = require('../controllers/Report.controller.js');

const router = express.Router();

router.route('/')
.get(getReports);
router.route('/:id').get(getReport);

router.route('/comment').post(addComment);

module.exports = router;