const pool = require("../../../../config/db");

async function getDealerById(dealer_id) {
  const result = await pool.query(
    'SELECT remaining_subscription, dealer_name, dealer_code FROM dealers WHERE id = $1',
    [dealer_id]
  );
  return result.rows[0];
}

module.exports = { getDealerById };
