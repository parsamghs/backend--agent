const pool = require("../../../../config/db");

const getStatusCountsFromDB = async (statuses, dealerId, start_date, end_date) => {
    let dateCondition = '';
    const params = [statuses, dealerId];

    if (start_date) { params.push(start_date); dateCondition += ` AND orders.order_date >= $${params.length}`; }
    if (end_date) { params.push(end_date); dateCondition += ` AND orders.order_date <= $${params.length}`; }

    const query = `
        SELECT orders.status, COUNT(*) AS count
        FROM orders
        JOIN receptions ON orders.reception_id = receptions.id
        JOIN customers ON receptions.customer_id = customers.id
        WHERE orders.status = ANY($1)
          AND customers.dealer_id = $2
          ${dateCondition}
        GROUP BY orders.status
    `;
    const result = await pool.query(query, params);
    return result.rows;
};

const getCanceledCountFromDB = async (canceledStatuses, dealerId, start_date, end_date) => {
    let dateCondition = '';
    const params = [canceledStatuses, dealerId];

    if (start_date) { params.push(start_date); dateCondition += ` AND orders.order_date >= $${params.length}`; }
    if (end_date) { params.push(end_date); dateCondition += ` AND orders.order_date <= $${params.length}`; }

    const query = `
        SELECT COUNT(*) AS canceled_count
        FROM orders
        JOIN receptions ON orders.reception_id = receptions.id
        JOIN customers ON receptions.customer_id = customers.id
        WHERE orders.status = ANY($1)
          AND customers.dealer_id = $2
          ${dateCondition}
    `;
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].canceled_count, 10);
};

const getCriticalCountFromDB = async (dealerId, criticalStatuses, start_date, end_date) => {
    let dateCondition = '';
    const params = [dealerId, criticalStatuses];

    if (start_date) { params.push(start_date); dateCondition += ` AND orders.order_date >= $${params.length}`; }
    if (end_date) { params.push(end_date); dateCondition += ` AND orders.order_date <= $${params.length}`; }

    const query = `
        SELECT COUNT(*) AS critical_count
        FROM orders
        JOIN receptions ON orders.reception_id = receptions.id
        JOIN customers ON receptions.customer_id = customers.id
        WHERE orders.estimated_arrival_days <= 0
          AND orders.status = ANY($2)
          AND customers.dealer_id = $1
          ${dateCondition}
    `;
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].critical_count, 10);
};

module.exports = { getStatusCountsFromDB, getCanceledCountFromDB, getCriticalCountFromDB };
