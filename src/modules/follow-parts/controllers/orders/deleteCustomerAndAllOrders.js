const { deleteCustomerAndAllOrdersService } = require('../../services/orders/deleteCustomerAndAllOrders');

exports.deleteCustomerAndAllOrders = async (req, res) => {
    const customerId = parseInt(req.params.customerId, 10);

    const result = await deleteCustomerAndAllOrdersService(req.user, customerId, req.dealer_id);

    res.status(result.status).json({ message: result.message });
};
