const pool = require("../../../../config/db");

async function findUserByIdAndDealer(userId, dealer_id) {
  const result = await pool.query(
    'SELECT * FROM login WHERE id = $1 AND dealer_id = $2',
    [userId, dealer_id]
  );
  return result.rows;
}

async function updateUserInDb(userId, dealer_id, fields, values) {
  const index = values.length + 1; // id
  values.push(userId);
  values.push(dealer_id);

  const updateQuery = `UPDATE login SET ${fields.join(', ')} WHERE id = $${index} AND dealer_id = $${index + 1}`;

  const result = await pool.query(updateQuery, values);
  return result;
}

module.exports = { findUserByIdAndDealer, updateUserInDb };
