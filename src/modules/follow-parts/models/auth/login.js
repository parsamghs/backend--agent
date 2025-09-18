const pool = require("../../../../config/db");

async function findUserByCodeMeli(code_meli) {
  const result = await pool.query('SELECT * FROM login WHERE code_meli = $1', [code_meli]);
  return result.rows[0];
}

async function findDealerById(dealer_id) {
  const result = await pool.query(
    'SELECT remaining_subscription, category, dealer_name FROM dealers WHERE id = $1',
    [dealer_id]
  );
  return result.rows[0];
}

module.exports = { findUserByCodeMeli, findDealerById };
