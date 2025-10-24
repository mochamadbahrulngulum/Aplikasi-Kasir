const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createTransaction, getTransactions, getTransactionDetail } = require('../app/controller/transactionController');

router.use(authMiddleware);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionDetail);

module.exports = router;
