const { addPiecesToCustomerService } = require('../../services/orders/addPiecesToCustomer');

async function addPiecesToCustomer(req, res) {
  const customer_id = parseInt(req.params.customer_id, 10);
  const result = await addPiecesToCustomerService(req.user, customer_id, req.body);
  return res.status(result.status).json({ message: result.message, ...(result.error && { error: result.error }) });
}

module.exports = { addPiecesToCustomer };
