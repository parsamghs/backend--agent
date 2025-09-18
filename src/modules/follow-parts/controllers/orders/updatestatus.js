const { updateOrderStatus } = require('../../services/orders/updatestatus');

exports.updatestatus = async (req, res) => {
  try {
    const result = await updateOrderStatus(req.user, parseInt(req.params.orderId, 10), req.body);
    res.status(200).json({
      message: 'عملیات به‌روزرسانی با موفقیت انجام شد.',
      details: result.successMessages,
      warnings: result.errorMessages.length > 0 ? result.errorMessages : undefined
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'خطای سرور' });
  }
};
