const { getOrdersCountsService } = require('../../services/orders/orderscount');

exports.getOrderscounts = async (req, res) => {
    try {
        const dealerId = req.user.dealer_id;
        const { start_date, end_date } = req.query;

        const stats = await getOrdersCountsService(dealerId, start_date, end_date);
        res.json({ stats });
    } catch (err) {
        console.error('getOrdersStats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
