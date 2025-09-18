async function countLogs(pool, whereSQL, params) {
  const countQuery = `SELECT COUNT(*) FROM logs ${whereSQL}`;
  const countResult = await pool.query(countQuery, params);
  return parseInt(countResult.rows[0].count, 10);
}

async function fetchLogs(pool, whereSQL, params, limit, offset) {
  params.push(limit, offset);

  const dataQuery = `
    SELECT id, log_time, action, message, user_name, phone_number
    FROM logs
    ${whereSQL}
    ORDER BY log_time DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;
  const result = await pool.query(dataQuery, params);
  return result.rows;
}

module.exports = {
  countLogs,
  fetchLogs,
};
