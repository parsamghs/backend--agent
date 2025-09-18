const pool = require("../../../../config/db");

const getCustomerById = async (customerId) => {
    const client = await pool.connect();
    try {
        const res = await client.query(
            'SELECT customer_name, dealer_id, phone_number FROM customers WHERE id = $1',
            [customerId]
        );
        return res.rows[0];
    } finally {
        client.release();
    }
};

const getReceptionsByCustomerId = async (customerId, client) => {
    const res = await client.query(
        'SELECT id FROM receptions WHERE customer_id = $1',
        [customerId]
    );
    return res.rows.map(row => row.id);
};

const getOrdersByReceptionId = async (receptionId, client) => {
    const res = await client.query(
        'SELECT id, status FROM orders WHERE reception_id = $1',
        [receptionId]
    );
    return res.rows;
};

const deleteOrderById = async (orderId, client) => {
    await client.query('DELETE FROM orders WHERE id = $1', [orderId]);
};

const updateOrderStatus = async (orderId, status, client) => {
    await client.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
};

const deleteReceptionById = async (receptionId, client) => {
    await client.query('DELETE FROM receptions WHERE id = $1', [receptionId]);
};

const countOrdersByReceptionId = async (receptionId, client) => {
    const res = await client.query('SELECT COUNT(*) FROM orders WHERE reception_id = $1', [receptionId]);
    return parseInt(res.rows[0].count, 10);
};

const countOrdersByCustomerId = async (customerId, client) => {
    const res = await client.query(
        `SELECT COUNT(*) FROM orders o
         INNER JOIN receptions r ON o.reception_id = r.id
         WHERE r.customer_id = $1`,
        [customerId]
    );
    return parseInt(res.rows[0].count, 10);
};

const deleteCustomerById = async (customerId, client) => {
    await client.query('DELETE FROM customers WHERE id = $1', [customerId]);
};

module.exports = {
    getCustomerById,
    getReceptionsByCustomerId,
    getOrdersByReceptionId,
    deleteOrderById,
    updateOrderStatus,
    deleteReceptionById,
    countOrdersByReceptionId,
    countOrdersByCustomerId,
    deleteCustomerById
};
