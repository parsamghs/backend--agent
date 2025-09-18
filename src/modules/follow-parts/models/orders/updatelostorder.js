const pool = require("../../../../config/db");

const getLostOrderById = async (id) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM lost_orders WHERE id = $1`, [id]);
    return result.rows[0];
  } finally {
    client.release();
  }
};

const updateLostOrderInDB = async ({
  id, part_id, piece_name, car_name, lost_description, count, lost_date, lost_time
}) => {
  const client = await pool.connect();
  try {
    const updateQuery = `
      UPDATE lost_orders
      SET
        part_id = COALESCE($1, part_id),
        piece_name = COALESCE($2, piece_name),
        car_name = COALESCE($3, car_name),
        lost_description = CASE
          WHEN $4::text IS NOT NULL AND $4::text <> '' THEN CONCAT_WS(' / ', lost_description::text, $4::text)
          ELSE lost_description
          END,
        count = COALESCE($5, count),
        lost_date = COALESCE($6, lost_date),
        lost_time = COALESCE($7, lost_time)
      WHERE id = $8
    `;
    await client.query(updateQuery, [
      part_id, piece_name, car_name, lost_description, count, lost_date, lost_time, id
    ]);
  } finally {
    client.release();
  }
};

module.exports = { getLostOrderById, updateLostOrderInDB };
