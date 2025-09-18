const { addOrderService } = require('../../services/orders/addOrder');

async function addOrder(req, res) {
  const result = await addOrderService(req.user, req.body);
  if (result.status === 201) {
    return res.status(201).json({ message: result.message, ...(result.customerExists && { note: 'این مشتری قبلاً در سیستم ثبت شده بود.' }) });
  } else {
    return res.status(result.status).json({ message: result.message });
  }
}

module.exports = { addOrder };
