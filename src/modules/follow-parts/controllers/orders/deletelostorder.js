const { deleteLostOrderService } = require('../../services/orders/deletelostorder');

exports.deleteLostOrder = async (req, res) => {
    const lostOrderId = parseInt(req.params.id, 10);
    const result = await deleteLostOrderService(req.user.id, lostOrderId);
    res.status(result.status).json({ message: result.message });
};
