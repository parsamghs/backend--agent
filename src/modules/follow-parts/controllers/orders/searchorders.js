const { searchOrdersService } = require('../../services/orders/searchorders');

exports.searchOrders = async (req, res) => {
  try {
    const dealerId = req.user.dealer_id;
    const { status, filter, search } = req.query;

    const data = await searchOrdersService(dealerId, { status, filter, search });
    res.json(data);
  } catch (err) {
    console.error('❌ searchOrders error:', err);
    res.status(500).json({ message: 'خطا در جستجوی سفارشات' });
  }
};
