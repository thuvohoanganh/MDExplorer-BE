const express = require('express');
const router = express.Router();

const importController = require('../controllers/import');

router.post('/metadata', importController.importMetadata);

router.get('/subject/:subject_id', importController.importData);

router.get('/neuro-sky-data', importController.importNeuroSkyData);

router.get('/between-distribution', importController.importBetweenDistribution);

router.get('/within-distribution', importController.importWithinDistribution);

router.get('/missingness', importController.importMissingness);

router.get('/update-dataset-name', importController.removeField);

router.get('/remove-column', importController.removeColumn);

router.post('/video', importController.importVideo);

router.get('/self-annotations/', importController.importSelfAnnotation);

router.get('/partner-annotations/', importController.importPartnerAnnotation);

router.get('/external-annotations/', importController.importExternalAnnotation);

module.exports = router;