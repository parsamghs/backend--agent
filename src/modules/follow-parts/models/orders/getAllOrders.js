const pool = require("../../../../config/db");

const getTotalCustomersCount = async (status, dealerId, canceledStatuses, criticalStatuses, specialStatuses) => {
    const res = await pool.query(`
        SELECT COUNT(DISTINCT customers.id) AS total
        FROM customers
        LEFT JOIN receptions ON receptions.customer_id = customers.id
        LEFT JOIN orders ON orders.reception_id = receptions.id
        WHERE customers.dealer_id = $2
          AND (
            $1::text IS NULL
            OR ($1 = 'لغو شده ها' AND orders.status = ANY($3))
            OR ($1 = 'بحرانی ها' AND orders.estimated_arrival_days <= 0 AND orders.status = ANY($4))
            OR ($1 NOT IN ('لغو شده ها', 'بحرانی ها') AND orders.status = ANY($5))
          )
    `, [status, dealerId, canceledStatuses, criticalStatuses, specialStatuses]);

    return parseInt(res.rows[0].total, 10);
};

const getCustomerIds = async (status, dealerId, canceledStatuses, criticalStatuses, specialStatuses, limit, offset) => {
    const res = await pool.query(`
        SELECT DISTINCT customers.id
        FROM customers
        LEFT JOIN receptions ON receptions.customer_id = customers.id
        LEFT JOIN orders ON orders.reception_id = receptions.id
        WHERE customers.dealer_id = $2
          AND (
            $1::text IS NULL
            OR ($1 = 'لغو شده ها' AND orders.status = ANY($3))
            OR ($1 = 'بحرانی ها' AND orders.estimated_arrival_days <= 0 AND orders.status = ANY($4))
            OR ($1 NOT IN ('لغو شده ها', 'بحرانی ها') AND orders.status = ANY($5))
          )
        ORDER BY customers.id
        LIMIT $6 OFFSET $7
    `, [status, dealerId, canceledStatuses, criticalStatuses, specialStatuses, limit, offset]);

    return res.rows.map(row => row.id);
};

const getOrdersByCustomerIds = async (customerIds, dealerId, status, canceledStatuses, criticalStatuses, specialStatuses) => {
    const res = await pool.query(`
        SELECT 
            customers.id AS customer_id,
            customers.customer_name,
            customers.phone_number AS customer_phone,
            receptions.id AS reception_id,
            receptions.reception_date,
            receptions.reception_number,
            receptions.car_status,
            receptions.chassis_number,
            receptions.admissions_specialist,
            receptions.orderer,
            orders.id AS order_id,
            orders.order_number,
            orders.order_date,
            orders.estimated_arrival_date,
            orders.delivery_date,
            orders.piece_name,
            orders.part_id,
            orders.number_of_pieces,
            orders.order_channel,
            orders.market_name,
            orders.market_phone,
            orders.estimated_arrival_days,
            orders.status,
            orders.description,
            orders.all_description,
            orders.appointment_date,
            orders.appointment_time,
            orders.final_order_number,
            orders.accounting_confirmation,
            orders.car_name
        FROM customers
        LEFT JOIN receptions ON receptions.customer_id = customers.id
        LEFT JOIN orders ON orders.reception_id = receptions.id
        WHERE customers.id = ANY($1) AND customers.dealer_id = $2
          AND (
            $3::text IS NULL
            OR ($3 = 'لغو شده ها' AND orders.status = ANY($4))
            OR ($3 = 'بحرانی ها' AND orders.estimated_arrival_days <= 0 AND orders.status = ANY($5))
            OR ($3 NOT IN ('لغو شده ها', 'بحرانی ها') AND orders.status = ANY($6))
          )
        ORDER BY customers.id, receptions.id, orders.id
    `, [customerIds, dealerId, status, canceledStatuses, criticalStatuses, specialStatuses]);

    return res.rows;
};

module.exports = {
    getTotalCustomersCount,
    getCustomerIds,
    getOrdersByCustomerIds
};
