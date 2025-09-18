const { updateOrderService } = require('../../services/orders/UpdateCustomer');

exports.updateOrder = async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    const { customer, reception, order, reception_id } = req.body;

    if (!customerId) return res.status(400).json({ message: 'customerId در URL الزامی است.' });

    await updateOrderService(req.user.id, customerId, { customer, reception, order, reception_id });

    res.json({ message: 'ویرایش با موفقیت انجام شد.' });
  } catch (err) {
    console.error('❌ Error in updateOrder:', err);
    res.status(500).json({ message: err.message || 'خطای سرور' });
  }
};
