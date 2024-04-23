const express = require('express');
const router = express.Router();

const subjectController = require('../controllers/subject');

router.get('/list', subjectController.getSubjectList);

router.post('/datatype', subjectController.getOneDataType);

module.exports = router;