const pool = require("../../../../config/db");

const findPartsByName = async (dealerId, words) => {
    if (!words || words.length === 0) return [];

    const conditions = [];
    const values = [];

    words.forEach((word, idx) => {
        const clean = word.replace(/\*/g, '').trim();
        if (clean.length === 0) return;
        conditions.push(`piece_name ILIKE $${idx + 1}`);
        values.push(`%${clean}%`);
    });

    if (conditions.length === 0) return [];

    conditions.push(`dealer_id = $${values.length + 1}`);
    values.push(dealerId);

    const query = `
      SELECT DISTINCT part_id, piece_name
      FROM lost_orders
      WHERE ${conditions.join(' AND ')}
      ORDER BY piece_name
      LIMIT 20
    `;
    const result = await pool.query(query, values);
    return result.rows;
};

module.exports = { findPartsByName };
