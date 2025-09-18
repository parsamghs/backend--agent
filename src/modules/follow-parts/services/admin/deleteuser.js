const pool = require('../../../../config/db');
const { findUserByIdAndDealer, deleteUserByIdAndDealer } = require('../../models/admin/deleteuser');

async function deleteUserService(id, dealer_id) {
  if (!dealer_id) {
    return { status: 403, message: 'دسترسی غیرمجاز: شناسه نمایندگی یافت نشد.' };
  }

  try {
    const user = await findUserByIdAndDealer(pool, id, dealer_id);
    if (user.length === 0) {
      return { status: 404, message: 'کاربری با این شناسه یا نمایندگی یافت نشد.' };
    }

    await deleteUserByIdAndDealer(pool, id, dealer_id);
    return { status: 200, message: 'کاربر با موفقیت حذف شد.' };
  } catch (err) {
    console.error('❌ خطا در حذف کاربر:', err);
    return { status: 500, message: 'خطای سرور هنگام حذف کاربر.' };
  }
}

module.exports = { deleteUserService };
