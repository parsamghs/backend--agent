const { getAllOrdersService } = require('../../services/orders/getAllOrders');

exports.getAllOrders = async (req, res) => {
    try {
        const result = await getAllOrdersService(req.user, req.query);
        res.json(result);
    } catch (err) {
        console.error('getAllOrders error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
