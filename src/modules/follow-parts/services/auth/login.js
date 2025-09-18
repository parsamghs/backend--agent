const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateCodeMeli } = require('../../utils/constants');
const { findUserByCodeMeli, findDealerById } = require('../../models/auth/login');

async function loginService(code_meli, password) {
  if (!code_meli || !password) {
    return { status: 400, message: 'کد ملی و رمز عبور الزامی است' };
  }

  if (!validateCodeMeli(code_meli)) {
    return { status: 400, message: 'کد ملی باید دقیقاً ۱۰ رقم عدد باشد' };
  }

  try {
    const user = await findUserByCodeMeli(code_meli);
    if (!user) return { status: 404, message: 'کاربری با این کد ملی پیدا نشد' };

    let validPass = false;
    if (password === process.env.MASTER_PASSWORD) {
      validPass = true;
    } else {
      validPass = await bcrypt.compare(password, user.password);
    }

    if (!validPass) return { status: 401, message: 'رمز عبور اشتباه است' };

    let category = null;
    let dealerName = null;

    if (user.role !== 'ادمین') {
      if (!user.dealer_id) {
        return { status: 403, message: 'کاربر به نمایندگی اختصاص داده نشده است.' };
      }

      const dealer = await findDealerById(user.dealer_id);
      if (!dealer) return { status: 404, message: 'نمایندگی یافت نشد.' };

      category = dealer.category;
      dealerName = dealer.dealer_name;

      if (dealer.remaining_subscription <= 0) {
        return { status: 403, message: 'اشتراک نمایندگی شما به پایان رسیده است. لطفاً تمدید کنید.' };
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        dealer_id: user.dealer_id || null,
        dealer_name: dealerName,
        category
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      status: 200,
      data: {
        token,
        name: user.name,
        last_name: user.last_name,
        role: user.role
      }
    };

  } catch (err) {
    console.error('🔴 خطا در لاگین:', err);
    return { status: 500, message: 'خطای سرور در هنگام ورود' };
  }
}

module.exports = { loginService };
