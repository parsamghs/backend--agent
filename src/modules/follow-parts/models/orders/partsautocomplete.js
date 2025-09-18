const pool = require("../../../../config/db");

const categoryTableMap = {
  'ایران خودرو': 'irankhodro_parts_id',
  'مدیران خودرو': 'mvm_parts_id',
  'تویوتا': 'toyota_parts_id',
  'ماموت': 'mammut_parts_id',
  'تست': 'test_parts_id'
};

/**
 * 
 * @param {string} category 
 * @param {string} query 
 * @returns {Promise<Array>}
 */
const getPartsByQuery = async (category, query) => {
  const tableName = categoryTableMap[category];
  if (!tableName) throw new Error(`دسته‌بندی نمایندگی معتبر نیست: ${category}`);

  const result = await pool.query(
    `SELECT technical_code, part_name 
     FROM ${tableName} 
     WHERE technical_code ILIKE $1
     ORDER BY technical_code
     LIMIT 50`,
    [`%${query.trim()}%`]
  );

  return result.rows;
};

module.exports = { getPartsByQuery };
