const bcrypt = require('bcryptjs');
const { validateWithRegex } = require('../../utils/validation');
const { CONSTANTS } = require('../../utils/constants');
const { findUserByIdAndDealer, updateUserInDb } = require('../../models/admin/updateuser');

async function updateUserService(userRole, dealer_id, userId, updateFields) {
  if (userRole !== 'مدیریت') {
    return { status: 403, message: 'شما دسترسی به این عملیات ندارید.' };
  }

  if (!dealer_id) {
    return { status: 403, message: 'دسترسی غیرمجاز: شناسه نمایندگی یافت نشد.' };
  }

  const { name, last_name, code_meli, password, role } = updateFields;

  if (!name && !last_name && !code_meli && !password && !role) {
    return { status: 400, message: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است.' };
  }

  const fields = [];
  const values = [];
  let index = 1;

  try {
    const existingUser = await findUserByIdAndDealer(userId, dealer_id);
    if (existingUser.length === 0) {
      return { status: 404, message: `کاربری با شناسه ${userId} و نمایندگی شما یافت نشد.` };
    }

    if (name !== undefined) {
      const result = validateWithRegex('name', name);
      if (!result.isValid) return { status: 400, message: `نام: ${result.message}` };
      fields.push(`name = $${index++}`);
      values.push(name);
    }

    if (last_name !== undefined) {
      const result = validateWithRegex('name', last_name);
      if (!result.isValid) return { status: 400, message: `نام خانوادگی: ${result.message}` };
      fields.push(`last_name = $${index++}`);
      values.push(last_name);
    }

    if (code_meli !== undefined) {
      const result = validateWithRegex('code_meli', code_meli);
      if (!result.isValid) return { status: 400, message: `کد ملی: ${result.message}` };
      fields.push(`code_meli = $${index++}`);
      values.push(code_meli);
    }

    if (password !== undefined) {
      const result = validateWithRegex('password', password);
      if (!result.isValid) return { status: 400, message: 'رمز عبور فقط باید شامل رقم و حداقل ۵ رقم باشد.' };
      const hashed = await bcrypt.hash(password, 10);
      fields.push(`password = $${index++}`);
      values.push(hashed);
    }

    if (role !== undefined) {
      if (!CONSTANTS.roles.includes(role)) {
        return { status: 400, message: 'نقش وارد شده معتبر نیست.' };
      }
      fields.push(`role = $${index++}`);
      values.push(role);
    }

    const result = await updateUserInDb(userId, dealer_id, fields, values);

    if (result.rowCount === 0) {
      return { status: 404, message: `کاربری با شناسه ${userId} و نمایندگی شما یافت نشد.` };
    }

    return { status: 200, message: 'کاربر با موفقیت به‌روزرسانی شد.' };
  } catch (err) {
    console.error('❌ خطا در به‌روزرسانی کاربر:', err);
    return { status: 500, message: 'خطای سرور در به‌روزرسانی کاربر.' };
  }
}

module.exports = { updateUserService };
