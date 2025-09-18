const pool = require("../../../../config/db");

const getLostOrderById = async (lostOrderId, client) => {
    const res = await client.query(
        'SELECT * FROM lost_orders WHERE id = $1',
        [lostOrderId]
    );
    return res.rows[0];
};

const getLostOrderNameById = async (lostOrderId, client) => {
    const res = await client.query(
        'SELECT piece_name FROM lost_orders WHERE id = $1',
        [lostOrderId]
    );
    return res.rows[0]?.piece_name || 'نامشخص';
};

const deleteLostOrderById = async (lostOrderId, client) => {
    await client.query('DELETE FROM lost_orders WHERE id = $1', [lostOrderId]);
};

module.exports = {
    getLostOrderById,
    getLostOrderNameById,
    deleteLostOrderById
};
