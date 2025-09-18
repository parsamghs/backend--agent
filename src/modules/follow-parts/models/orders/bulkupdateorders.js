const pool = require("../../../../config/db");

const getOrderDetails = async (orderIds) => {
    const client = await pool.connect();
    try {
        const res = await client.query(
            `SELECT o.id, o.piece_name, r.customer_id, COALESCE(c.customer_name, 'نامشخص') AS customer_name, c.phone_number
             FROM orders o
             LEFT JOIN receptions r ON o.reception_id = r.id
             LEFT JOIN customers c ON r.customer_id = c.id
             WHERE o.id = ANY($1::int[])`,
            [orderIds]
        );
        return res.rows;
    } finally {
        client.release();
    }
};

const updateOrders = async (params) => {
    const { client, orderIds, newStatus, description, deliveryDate, finalOrderNumber, convertedAppointmentDate, appointmentTime, isAppointmentStatus } = params;
    const res = await client.query(
        `UPDATE orders
         SET status = $1,
             delivery_date = COALESCE($3, delivery_date),
             final_order_number = COALESCE($4, final_order_number),
             appointment_date = CASE WHEN $8 THEN $6 ELSE appointment_date END,
             appointment_time = CASE WHEN $8 THEN $7 ELSE appointment_time END,
             description = CASE
                 WHEN $2::text IS NOT NULL THEN CONCAT_WS(' / ', description::text, $2::text)
                 ELSE description
             END
         WHERE id = ANY($5::int[])`,
        [newStatus, description, deliveryDate, finalOrderNumber, orderIds, convertedAppointmentDate, appointmentTime, isAppointmentStatus]
    );
    return res;
};

module.exports = {
    getOrderDetails,
    updateOrders
};
