const pool = require("../../../../config/db");

const getLogs = async ({ dealerId, startDate, endDate, userName }) => {
  const params = [];
  let whereClauses = [];

  if (dealerId) {
    params.push(dealerId);
    whereClauses.push(`dealer_id = $${params.length}`);
  }

  if (startDate) {
    params.push(startDate);
    whereClauses.push(`log_time >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate);
    whereClauses.push(`log_time <= $${params.length}`);
  }

  if (userName) {
    params.push(`%${userName}%`);
    whereClauses.push(`user_name ILIKE $${params.length}`);
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const result = await pool.query(`
    SELECT user_name, action, message, log_time, phone_number
    FROM logs
    ${whereSQL}
    ORDER BY log_time DESC
  `, params);

  return result.rows;
};

module.exports = { getLogs };
