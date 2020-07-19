const express = require('express');
const router = express.Router();
const paymentControllers = require('../controllers/payment');
router.get('/', paymentControllers.getPayment);
router.post('/data', paymentControllers.postData);
router.post('/token', paymentControllers.postToken);

module.exports = router;