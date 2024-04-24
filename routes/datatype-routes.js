const express = require('express');
const router = express.Router();

const datatypeController = require('../controllers/datatype');

router.get('/metadata', datatypeController.getDataTypeMetadata);


module.exports = router;