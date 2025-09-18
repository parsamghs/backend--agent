const pool = require("../../../../config/db");

const getOrderById = async (orderId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT o.id,
              o.reception_id,
              o.piece_name,
              r.customer_id,
              COALESCE(c.customer_name, 'نامشخص') AS customer_name,
              c.phone_number
       FROM orders o
       LEFT JOIN receptions r ON o.reception_id = r.id
       LEFT JOIN customers c ON r.customer_id = c.id
       WHERE o.id = $1`,
      [orderId]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const updateOrderInDB = async ({
  id, status, delivery_date, description, all_description, appointment_date, appointment_time,
  cancellation_date, cancellation_time, final_order_number
}) => {
  const client = await pool.connect();
  try {
    const updateQuery = `
      UPDATE orders
      SET
        status = COALESCE($1, status),
        delivery_date = COALESCE($2, delivery_date),
        description = CASE
          WHEN $3::text IS NOT NULL THEN CONCAT_WS(' / ', description::text, $3::text)
          ELSE description
        END,
        all_description = CASE
          WHEN $4::text IS NOT NULL THEN CONCAT_WS(' / ', all_description::text, $4::text)
          ELSE all_description
        END,
        appointment_date = COALESCE($5, appointment_date),
        appointment_time = COALESCE($6, appointment_time),
        cancellation_date = COALESCE($7, cancellation_date),
        cancellation_time = COALESCE($8, cancellation_time),
        final_order_number = COALESCE($9, final_order_number)
      WHERE id = $10;
    `;

    const result = await client.query(updateQuery, [
      status, delivery_date, description, all_description, appointment_date, appointment_time,
      cancellation_date, cancellation_time, final_order_number, id
    ]);

    return result.rowCount;
  } finally {
    client.release();
  }
};

const insertLostOrder = async (data) => {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO lost_orders (
        part_id, piece_name, car_name, lost_description, count, lost_date, lost_time, status, dealer_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;
    await client.query(query, [
      data.part_id || null,
      data.piece_name || 'نامشخص',
      data.car_name || 'نامشخص',
      data.lost_description || 'بدون توضیحات',
      data.count?.toString() || '1',
      data.lost_date,
      data.lost_time,
      data.status,
      data.dealer_id || null
    ]);
  } finally {
    client.release();
  }
};

module.exports = { getOrderById, updateOrderInDB, insertLostOrder };
