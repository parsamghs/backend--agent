const pool = require("../../../../config/db");

async function getUsersWithStatsModel(dealer_id) {
  return pool.query(
    `
    SELECT 
      l.id, l.name, l.last_name, l.code_meli, l.role,
      s.last_active
    FROM login l
    LEFT JOIN users_stats s ON l.id = s.id
    WHERE l.dealer_id = $1
    `,
    [dealer_id]
  );
}

module.exports = { getUsersWithStatsModel };
