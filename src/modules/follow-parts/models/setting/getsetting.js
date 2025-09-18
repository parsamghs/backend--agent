const pool = require("../../../../config/db");

const getSettingByDealerId = async (dealerId) => {
  const result = await pool.query(
    'SELECT * FROM setting WHERE dealer_id = $1 LIMIT 1',
    [dealerId]
  );
  return result.rows[0] || null;
};

module.exports = { getSettingByDealerId };
