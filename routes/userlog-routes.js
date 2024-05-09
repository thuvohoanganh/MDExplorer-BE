const express = require('express');
const router = express.Router();

const userLogController = require('../controllers/userlog');

router.post('/submit-log', userLogController.submitLog);
router.get('/get-all-logs', userLogController.getUserLogs);

module.exports = router;