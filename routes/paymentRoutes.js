const express = require('express');
const router = express.Router();
const paymentControllers = require('../controllers/payment');
router.get('/', paymentControllers.getPayment);
router.post('/data', paymentControllers.postData);

module.exports = router;