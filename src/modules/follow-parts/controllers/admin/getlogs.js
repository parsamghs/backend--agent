const { getLogsService } = require('../../services/admin/getlogs');

async function getLogs(req, res) {
  const userRole = req.user?.role;
  const dealerId = req.user?.dealer_id;

  const result = await getLogsService(userRole, dealerId, req.query);

  return res.status(result.status).json(result.data);
}

module.exports = { getLogs };
