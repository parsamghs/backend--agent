const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const dealerAccessMiddleware = require('../../middlewares/dealerAccessMiddleware');
const UpdateStats = require('../../middlewares/updatestatsMiddleware');
const {updateOrder} = require('../../controllers/orderscontrollers/updateOrder');


router.patch('/:orderId', authMiddleware, dealerAccessMiddleware, roleMiddleware('انباردار', 'حسابدار','پذیرش','مدیریت'), UpdateStats, updateOrder);


module.exports = router;

