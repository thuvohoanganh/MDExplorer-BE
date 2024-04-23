const express = require('express');
const router = express.Router();

const subjectController = require('../controllers/subject');

router.get('/multimodal-data/:subject_id', subjectController.getSubjectMultiModalData);

router.get('/video/:subject_id', subjectController.getVideo);

router.post('/datatype-overview', subjectController.getDataTypeOverview);

module.exports = router;