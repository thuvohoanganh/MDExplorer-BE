const express = require('express');
const router = express.Router();

const subjectController = require('../controllers/subject');

router.get('/multimodal-data/:subject_id', subjectController.getSubjectMultiModalData);

router.get('/video/:subject_id', subjectController.getVideo);

router.post('/statistic', subjectController.getStatistic);

router.get('/import/:subject_id', subjectController.importData);


module.exports = router;