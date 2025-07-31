const express = require('express');

const axios = require("axios");
const router = express.Router();
const { selectCompany, PredictPrices } = require('../controllers/CompanyStock');

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";


router.post('/companystock',selectCompany);
router.post('/predict',PredictPrices);

router.post('/deep-analysis',async (req,res) => {
    const { name } = req.body;
    console.log(name);
    try{
        const response = await axios.post(`${PYTHON_BACKEND_URL}/run-deep-analysis`, {
            symbol: name,
        });
        console.log(response.data);
        res.json(response.data);
    } catch (error){
        res.status(500).json({ message: `Something went wrong ${error}` });
    }
});
router.post('/analysis-query',async (req,res) => {
    // console.log(req.body);
    const { question, context_data,context_type } = req.body;
    console.log(context_data)

    try{
        console.log(`Forwarding request to Python at: ${PYTHON_BACKEND_URL}/ask-query`);
        const response = await axios.post(`${PYTHON_BACKEND_URL}/ask-query`, {
            question: question,
            context_data: context_data,
            context_type: context_type
        });
        // console.log(response.data);
        res.json(response.data);
    } catch (error){
        res.status(500).json({ message: `Something went wrong ${error}` });
    }
});


// router.post('/analysisDashBoard')

module.exports = router;