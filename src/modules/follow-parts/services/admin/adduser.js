const pool = require('../../../../config/db');
const bcrypt = require('bcryptjs');
const { validateWithRegex } = require('../../utils/validation');
const { CONSTANTS } = require('../../utils/constants');
const { findUserByCodeMeli, insertUser } = require('../../models/admin/adduser');

async function addUserService({ name, last_name, code_meli, password, role, dealer_id }) {
  if (!dealer_id) {
    return { status: 403, message: 'دسترسی غیرمجاز: شناسه نمایندگی یافت نشد.' };
  }

  let result = validateWithRegex('name', name);
  if (!result.isValid) return { status: 400, message: `نام: ${result.message}` };

  result = validateWithRegex('name', last_name);
  if (!result.isValid) return { status: 400, message: `نام خانوادگی: ${result.message}` };

  result = validateWithRegex('code_meli', code_meli);
  if (!result.isValid) return { status: 400, message: `کد ملی: ${result.message}` };

  result = validateWithRegex('password', password);
  if (!result.isValid) {
    return { status: 400, message: `رمز عبور: فقط باید شامل رقم و حداقل ۵ رقم باشد.` };
  }

  if (!CONSTANTS.roles.includes(role)) {
    return { status: 400, message: 'نقش وارد شده معتبر نیست.' };
  }

  try {
    const check = await findUserByCodeMeli(pool, code_meli);
    if (check.length > 0) {
      return { status: 409, message: 'کاربری با این کد ملی قبلاً ثبت شده است.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await insertUser(pool, { name, last_name, code_meli, hashedPassword, role, dealer_id });

    return { status: 201, message: 'کاربر با موفقیت اضافه شد.' };
  } catch (err) {
    console.error('❌ خطا در افزودن کاربر:', err);
    return { status: 500, message: 'خطای سرور در افزودن کاربر.' };
  }
}

module.exports = { addUserService };
