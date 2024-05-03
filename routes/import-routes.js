const express = require('express');
const router = express.Router();

const importController = require('../controllers/import');

router.post('/metadata', importController.importMetadata);

router.get('/subject/:subject_id', importController.importData);

router.get('/gather_missingness', importController.gatherMissing);

router.get('/gather_within_distribution', importController.gatherWithin);

router.get('/between-distribution', importController.importBetweenDistribution);

router.get('/update-dataset-name', importController.addField);

router.get('/remove-column', importController.removeColumn);

router.post('/video', importController.importVideo);

router.get('/sel-annotations/', importController.importSelfAnnotation);

module.exports = router;