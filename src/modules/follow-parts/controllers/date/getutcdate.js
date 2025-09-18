const { getTimesService } = require('../../services/date/getutcdate');

function getTimes(req, res) {
  const times = getTimesService();
  res.json(times);
}

module.exports = { getTimes };
