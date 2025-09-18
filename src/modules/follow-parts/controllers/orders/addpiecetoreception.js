const { addPiecesToExistingReceptionService } = require('../../services/orders/addpiecetoreception');

async function addPiecesToExistingReception(req, res) {
  const reception_id = parseInt(req.params.reception_id, 10);
  const { orders } = req.body;
  const result = await addPiecesToExistingReceptionService(req.user, reception_id, orders);
  return res.status(result.status).json({ message: result.message, ...(result.error && { error: result.error }) });
}

module.exports = { addPiecesToExistingReception };
