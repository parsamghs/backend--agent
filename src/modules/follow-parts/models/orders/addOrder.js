const pool = require("../../../../config/db");

async function getCustomerByPhone(client, phone_number, dealer_id) {
  const res = await client.query(
    `SELECT id FROM customers WHERE phone_number = $1 AND dealer_id = $2`,
    [phone_number, dealer_id]
  );
  return res.rows[0];
}

async function insertCustomer(client, customer_name, phone_number, dealer_id) {
  const res = await client.query(
    `INSERT INTO customers (customer_name, phone_number, dealer_id)
     VALUES ($1, $2, $3) RETURNING id`,
    [customer_name, phone_number, dealer_id]
  );
  return res.rows[0].id;
}

async function getReceptionByCustomerAndNumber(client, customer_id, reception_number) {
  const res = await client.query(
    `SELECT id FROM receptions WHERE customer_id = $1 AND reception_number = $2`,
    [customer_id, reception_number]
  );
  return res.rows[0];
}

async function insertReception(client, receptionData) {
  const res = await client.query(
    `INSERT INTO receptions (reception_date, reception_number, customer_id, car_status, chassis_number, orderer, admissions_specialist)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      receptionData.reception_date,
      receptionData.reception_number,
      receptionData.customer_id,
      receptionData.car_status,
      receptionData.chassis_number || null,
      receptionData.orderer || null,
      receptionData.admissions_specialist || null
    ]
  );
  return res.rows[0].id;
}

async function insertOrder(client, orderData) {
  const res = await client.query(
    `INSERT INTO orders (
      customer_id, piece_name, part_id, number_of_pieces,
      order_channel, market_name, market_phone,
      order_date, estimated_arrival_days,
      estimated_arrival_date, all_description,
      reception_id, status, order_number,
      car_name, accounting_confirmation
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
    ) RETURNING id`,
    [
      orderData.customer_id,
      orderData.piece_name,
      orderData.part_id,
      orderData.number_of_pieces,
      orderData.order_channel,
      orderData.market_name || null,
      orderData.market_phone || null,
      orderData.order_date,
      orderData.estimated_arrival_days,
      orderData.estimated_arrival_date,
      orderData.all_description || null,
      orderData.reception_id,
      orderData.status,
      orderData.order_number || null,
      orderData.car_name,
      orderData.accounting_confirmation
    ]
  );
  return res.rows[0].id;
}

async function countActiveOrders(client, customer_id) {
  const res = await client.query(
    `SELECT COUNT(*) AS active_count
     FROM orders
     WHERE customer_id = $1
       AND status NOT IN (
         'لغو توسط شرکت',
         'عدم دریافت',
         'عدم پرداخت حسابداری',
         'حذف شده',
         'انصراف مشتری',
         'تحویل شد',
         'تحویل نشد'
       )`,
    [customer_id]
  );
  return parseInt(res.rows[0].active_count, 10);
}

module.exports = {
  getCustomerByPhone,
  insertCustomer,
  getReceptionByCustomerAndNumber,
  insertReception,
  insertOrder,
  countActiveOrders
};
