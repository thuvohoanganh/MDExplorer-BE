const express = require('express');
const router = express.Router();

const userLogController = require('../controllers/userlog');

router.post('/submit-log', userLogController.submitLog);

module.exports = router;