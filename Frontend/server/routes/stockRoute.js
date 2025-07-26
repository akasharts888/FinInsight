const express = require('express');
const router = express.Router();
const { selectCompany, PredictPrices } = require('../controllers/CompanyStock');

router.post('/companystock',selectCompany);
router.post('/predict',PredictPrices);
// router.post('/analysisDashBoard')

module.exports = router;