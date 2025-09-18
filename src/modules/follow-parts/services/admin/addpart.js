const pool = require('../../../../config/db');
const { validateWithRegex } = require('../../utils/validation');
const { addPartModel } = require('../../models/admin/addpart');

async function addPartService(category, technical_code, part_name) {
  let result = validateWithRegex('technical_code', technical_code);
  if (!result.isValid) {
    return { status: 400, message: `کد قطعه: ${result.message || 'نامعتبر است.'}` };
  }

  result = validateWithRegex('part_name', part_name);
  if (!result.isValid) {
    return { status: 400, message: `نام قطعه: ${result.message}` };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await addPartModel(client, category, technical_code, part_name);

    await client.query('COMMIT');
    return { status: 201, message: 'قطعه با موفقیت اضافه شد.' };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ خطا در افزودن قطعه:', err);
    return { status: 500, message: 'خطای سرور' };
  } finally {
    client.release();
  }
}

module.exports = { addPartService };
