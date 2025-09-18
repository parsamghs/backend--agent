const pool = require("../../../../config/db");

/**
 * 
 * @param {number} dealerId 
 * @param {Object} options
 * @returns {Promise<Array>}
 */
const searchLostOrders = async (dealerId, { search, filter, date }) => {
  const filtersMap = {
    piece_name: 'piece_name',
    part_id: 'part_id::text',
    car_name: 'car_name',
    lost_date: 'lost_date'
  };

  let whereClauses = [`dealer_id = $1`];
  let values = [dealerId];
  let paramIndex = 2;

  if (filter && search && filtersMap[filter]) {
    if (filter === 'lost_date') {
      whereClauses.push(`${filtersMap[filter]} = $${paramIndex++}`);
      values.push(search);
    } else {
      whereClauses.push(`${filtersMap[filter]} ILIKE $${paramIndex++}`);
      values.push(`%${search}%`);
    }
  } else if (search) {
    whereClauses.push(`(
      piece_name ILIKE $${paramIndex} OR
      part_id::text ILIKE $${paramIndex} OR
      car_name ILIKE $${paramIndex}
    )`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (date) {
    whereClauses.push(`lost_date = $${paramIndex++}`);
    values.push(date);
  }

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const query = `
    SELECT 
      id,
      part_id,
      piece_name,
      car_name,
      lost_description,
      count,
      status,
      lost_date,
      lost_time
    FROM lost_orders
    ${whereSQL}
    ORDER BY lost_date DESC, lost_time DESC
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

module.exports = { searchLostOrders };
