const pool = require("../../../../config/db");

async function insertReception(client, receptionData) {
  const res = await client.query(
    `INSERT INTO receptions (customer_id, reception_number, reception_date, car_status, chassis_number, orderer, admissions_specialist)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      receptionData.customer_id,
      receptionData.reception_number,
      receptionData.reception_date,
      receptionData.car_status,
      receptionData.chassis_number || null,
      receptionData.orderer || null,
      receptionData.admissions_specialist || null
    ]
  );
  return res.rows[0].id;
}

async function getCustomerById(client, customer_id) {
  const res = await client.query(
    'SELECT customer_name, phone_number FROM customers WHERE id = $1',
    [customer_id]
  );
  return res.rows[0];
}

async function insertOrder(client, orderData) {
  const res = await client.query(
    `INSERT INTO orders (
      customer_id, reception_id, order_number, piece_name, part_id, number_of_pieces, 
      order_channel, market_name, market_phone, order_date,
      estimated_arrival_days, estimated_arrival_date, status, all_description,
      car_name, accounting_confirmation
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
    ) RETURNING id`,
    [
      orderData.customer_id,
      orderData.reception_id,
      orderData.order_number,
      orderData.piece_name,
      orderData.part_id,
      orderData.number_of_pieces,
      orderData.order_channel,
      orderData.market_name || null,
      orderData.market_phone || null,
      orderData.order_date,
      orderData.estimated_arrival_days || null,
      orderData.estimated_arrival_date || null,
      orderData.status,
      orderData.all_description || null,
      orderData.car_name,
      orderData.accounting_confirmation
    ]
  );
  return res.rows[0].id;
}

module.exports = {
  insertReception,
  getCustomerById,
  insertOrder
};
