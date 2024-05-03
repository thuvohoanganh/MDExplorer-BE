const express = require('express');
const router = express.Router();

const subjectController = require('../controllers/subject');

router.post('/multimodal-data/', subjectController.getSubjectMultiModalData);

router.post('/video', subjectController.getVideo);

router.post('/statistic', subjectController.getStatistic);

router.post('/list', subjectController.getSubjectList);

module.exports = router;