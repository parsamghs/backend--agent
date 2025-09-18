const pool = require("../../../../config/db");
const getCarsByTable = async (tableName) => {
    const result = await pool.query(
        `SELECT car_name FROM ${tableName} ORDER BY car_name`
    );
    return result.rows;
};

module.exports = { getCarsByTable };
