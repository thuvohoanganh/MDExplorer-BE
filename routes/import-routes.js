const express = require('express');
const router = express.Router();

const importController = require('../controllers/import');

router.post('/metadata', importController.kemocon.importMetadata);

router.get('/subject/:subject_id', importController.kemocon.importData);

router.get('/neuro-sky-data', importController.kemocon.importNeuroSkyData);

router.get('/between-distribution', importController.kemocon.importBetweenDistribution);

router.get('/within-distribution', importController.kemocon.importWithinDistribution);

router.get('/missingness', importController.kemocon.importMissingness);

router.get('/update-dataset-name', importController.kemocon.removeField);

router.get('/remove-column', importController.kemocon.removeColumn);

router.post('/video', importController.kemocon.importVideo);

router.get('/self-annotations/', importController.kemocon.importSelfAnnotation);

router.get('/partner-annotations/', importController.kemocon.importPartnerAnnotation);

router.get('/external-annotations/', importController.kemocon.importExternalAnnotation);

router.post('/k-emophone/multimodal', importController.kemophone.importData);
router.get('/k-emophone/within-distribution', importController.kemophone.importWithinDistribution);
router.get('/k-emophone/between-distribution', importController.kemophone.importBetweenDistribution);
router.get('/k-emophone/missingness', importController.kemophone.importMissingness);
router.get('/k-emophone/delete', importController.kemophone.deleteCsv);

module.exports = router;