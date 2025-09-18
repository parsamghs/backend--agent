const { updateLostOrder } = require('../../services/orders/updatelostorder');

exports.updateLostOrder = async (req, res) => {
  try {
    const response = await updateLostOrder(req.user, parseInt(req.params.id, 10), req.body);
    res.status(200).json(response);
  } catch (err) {
    console.error('خطا در به‌روزرسانی قطعه گم‌شده:', err);
    res.status(err.status || 500).json({
      message: err.message || 'خطا در سرور هنگام به‌روزرسانی قطعه.',
      error: err.error || undefined
    });
  }
};
