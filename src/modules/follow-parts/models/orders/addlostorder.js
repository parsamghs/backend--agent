const pool = require("../../../../config/db");

async function insertLostOrder(client, lostOrderData) {
  const insertOrderQuery = `
    INSERT INTO lost_orders (
      part_id, piece_name, car_name, lost_description, count, status, lost_date, lost_time, dealer_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id;
  `;

  const values = [
    lostOrderData.part_id || null,
    lostOrderData.piece_name,
    lostOrderData.car_name,
    lostOrderData.lost_description || null,
    lostOrderData.count || null,
    lostOrderData.status,
    lostOrderData.lost_date || null,
    lostOrderData.lost_time || null,
    lostOrderData.dealer_id
  ];

  const result = await client.query(insertOrderQuery, values);
  return result.rows[0].id;
}

module.exports = { insertLostOrder };
