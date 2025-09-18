const pool = require("../../../../config/db");

const getLostOrdersFromDB = async (dealerId, limit, offset) => {
    const result = await pool.query(
        `SELECT 
            id,
            part_id,
            piece_name,
            car_name,
            lost_description,
            count,
            status,
            lost_date,
            lost_time
        FROM lost_orders
        WHERE dealer_id = $3
        ORDER BY lost_date DESC, lost_time DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset, dealerId]
    );
    return result.rows;
};

const countLostOrdersFromDB = async (dealerId) => {
    const countResult = await pool.query(
        'SELECT COUNT(*) FROM lost_orders WHERE dealer_id = $1',
        [dealerId]
    );
    return parseInt(countResult.rows[0].count, 10);
};

module.exports = { getLostOrdersFromDB, countLostOrdersFromDB };
