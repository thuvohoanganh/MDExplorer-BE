const express = require('express');
const router = express.Router();

const importController = require('../controllers/import');

router.post('/metadata', importController.importMetadata);

router.get('/subject/:subject_id', importController.importData);

router.get('/gathermissingness', importController.gatherMissing);

router.get('/gather_within_distribution', importController.gatherWithin);

router.get('/between-distribution', importController.importBetweenDistribution);

module.exports = router;