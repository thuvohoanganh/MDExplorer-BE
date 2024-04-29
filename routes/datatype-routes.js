const express = require('express');
const router = express.Router();

const datatypeController = require('../controllers/datatype');
const subjectController = require('../controllers/subject');

router.get('/list', datatypeController.getDataTypeList);

router.post('/metadata', datatypeController.getDataTypeMetadata);

router.post('/all-subjects', subjectController.getOneDataType);

module.exports = router;