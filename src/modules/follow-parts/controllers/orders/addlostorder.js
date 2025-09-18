const { addLostOrderService } = require('../../services/orders/addlostorder');

async function addLostOrder(req, res) {
  const user = req.user;
  const lostOrderData = req.body;

  const result = await addLostOrderService(user, lostOrderData);

  return res.status(result.status).json({ message: result.message });
}

module.exports = { addLostOrder };
