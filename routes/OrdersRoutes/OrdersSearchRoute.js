const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const dealerAccessMiddleware = require('../../middlewares/dealerAccessMiddleware');
const UpdateStats = require('../../middlewares/updatestatsMiddleware');
const {searchOrders} = require('../../controllers/orderscontrollers/searchorders');


router.get('/', authMiddleware, dealerAccessMiddleware, roleMiddleware('انباردار', 'مدیریت', 'پذیرش', 'حسابدار'), UpdateStats, searchOrders);


module.exports = router;