const pool = require("../../../../config/db");

const getLostOrders = async ({ dealerId, fromDate, toDate }) => {
  const result = await pool.query(
    `
    SELECT 
      part_id,
      piece_name,
      car_name,
      lost_description,
      count,
      lost_date,
      lost_time,
      status
    FROM lost_orders
    WHERE lost_date BETWEEN $1 AND $2 AND dealer_id = $3
    ORDER BY lost_date DESC
    `,
    [fromDate, toDate, dealerId]
  );

  return result.rows;
};

module.exports = { getLostOrders };
