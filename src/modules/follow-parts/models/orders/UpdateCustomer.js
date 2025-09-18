const pool = require("../../../../config/db");

const updateCustomer = async (customerId, customerData, client) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(customerData)) {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }

  if (fields.length === 0) return null;

  values.push(customerId);
  await client.query(`UPDATE customers SET ${fields.join(', ')} WHERE id = $${idx}`, values);

  const result = await client.query('SELECT customer_name, phone_number FROM customers WHERE id = $1', [customerId]);
  return result.rows[0] || null;
};

const updateReception = async (customerId, receptionId, receptionData, client) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(receptionData)) {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }

  if (fields.length === 0) return null;

  values.push(receptionId, customerId);
  await client.query(
    `UPDATE receptions SET ${fields.join(', ')} WHERE id = $${idx++} AND customer_id = $${idx}`,
    values
  );

  const result = await client.query('SELECT reception_number FROM receptions WHERE id = $1', [receptionId]);
  return result.rows[0] || null;
};

const updateOrder = async (customerId, receptionId, orderId, orderData, client) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(orderData)) {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }

  if (fields.length === 0) return null;

  values.push(orderId, receptionId, customerId);
  await client.query(
    `UPDATE orders SET ${fields.join(', ')} WHERE id = $${idx++} AND reception_id = $${idx++} AND customer_id = $${idx}`,
    values
  );

  const result = await client.query('SELECT piece_name FROM orders WHERE id = $1', [orderId]);
  return result.rows[0] || null;
};

module.exports = { updateCustomer, updateReception, updateOrder };
