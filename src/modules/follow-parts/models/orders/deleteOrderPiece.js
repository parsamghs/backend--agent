const pool = require("../../../../config/db");

const getOrderById = async (orderId, client) => {
    const res = await client.query(
        `SELECT o.id, o.reception_id, o.piece_name, o.status, r.customer_id
         FROM orders o
         LEFT JOIN receptions r ON o.reception_id = r.id
         WHERE o.id = $1`,
        [orderId]
    );
    return res.rows[0];
};

const getCustomerById = async (customerId, client) => {
    const res = await client.query(
        'SELECT customer_name, phone_number FROM customers WHERE id = $1',
        [customerId]
    );
    return res.rows[0];
};

const deleteOrderById = async (orderId, client) => {
    await client.query('DELETE FROM orders WHERE id = $1', [orderId]);
};

const deleteReceptionById = async (receptionId, client) => {
    await client.query('DELETE FROM receptions WHERE id = $1', [receptionId]);
};

const deleteCustomerById = async (customerId, client) => {
    await client.query('DELETE FROM customers WHERE id = $1', [customerId]);
};

const updateOrderStatus = async (orderId, status, client) => {
    await client.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
};

const countOrdersByReceptionId = async (receptionId, client) => {
    const res = await client.query('SELECT COUNT(*) AS count FROM orders WHERE reception_id = $1', [receptionId]);
    return parseInt(res.rows[0].count, 10);
};

const countReceptionsByCustomerId = async (customerId, client) => {
    const res = await client.query('SELECT COUNT(*) AS count FROM receptions WHERE customer_id = $1', [customerId]);
    return parseInt(res.rows[0].count, 10);
};

module.exports = {
    getOrderById,
    getCustomerById,
    deleteOrderById,
    deleteReceptionById,
    deleteCustomerById,
    updateOrderStatus,
    countOrdersByReceptionId,
    countReceptionsByCustomerId
};
