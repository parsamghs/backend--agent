const pool = require('../../../../config/db');

const updateSettingService = async (dealerId, body) => {
  const allowedFields = ['vor', 'vis', 'market', 'warhouse_charge', 'accounting_approval'];
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      const value = body[key];

      if (key !== 'accounting_approval') {
        if (typeof value !== 'string' || value.length > 2) {
          throw new Error(`مقدار "${key}" نامعتبر است.`);
        }
      } else {
        if (typeof value !== 'boolean') {
          throw new Error(`مقدار "${key}" باید بولین (true/false) باشد.`);
        }
      }
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) {
    throw new Error('هیچ فیلدی برای ویرایش ارسال نشده است.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT id FROM setting WHERE dealer_id = $1 LIMIT 1`,
      [dealerId]
    );

    if (existing.rows.length > 0) {
      const updateQuery = `
        UPDATE setting
        SET ${fields.join(', ')}
        WHERE dealer_id = $${paramIndex}
      `;
      values.push(dealerId);
      await client.query(updateQuery, values);

    } else {
      const insertFields = [...allowedFields.filter(f => body[f] !== undefined), 'dealer_id'];
      const insertValues = insertFields.map(f => f === 'dealer_id' ? dealerId : body[f]);
      const insertParams = insertFields.map((_, i) => `$${i + 1}`);
      const insertQuery = `
        INSERT INTO setting (${insertFields.join(', ')})
        VALUES (${insertParams.join(', ')})
      `;
      await client.query(insertQuery, insertValues);
    }

    await client.query('COMMIT');
    return { message: 'تنظیمات با موفقیت ثبت/ویرایش شدند.' };

  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { updateSettingService };
