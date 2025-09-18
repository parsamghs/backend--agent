const moment = require('moment-jalaali');
const { insertLostOrder } = require('../../models/orders/addlostorder');
const createLog = require('../../utils/createlog');
const pool = require('../../../../config/db');

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

async function addLostOrderService(user, lostOrderData) {
  if (!lostOrderData.piece_name || !lostOrderData.car_name) {
    return { status: 400, message: "نام قطعه و نام خودرو اجباری هستند." };
  }

  if (lostOrderData.count && !/^\d+$/.test(lostOrderData.count)) {
    return { status: 400, message: "فیلد count باید فقط شامل عدد باشد." };
  }

  if (!user || !user.dealer_id) {
    return { status: 403, message: 'شناسه نمایندگی پیدا نشد.' };
  }

  let lostDateGregorian = null;
  if (lostOrderData.lost_date) {
    lostDateGregorian = moment(lostOrderData.lost_date, ['jYYYY/jMM/jDD', 'jYYYY-MM-DD']).format('YYYY-MM-DD');
  }

  let lostTime24 = null;
  if (lostOrderData.lost_time) {
    lostTime24 = moment(lostOrderData.lost_time, ['hh:mm A', 'hh:mm:ss A']).format('HH:mm:ss');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const lostOrderId = await insertLostOrder(client, {
      ...lostOrderData,
      status: 'از دست رفته',
      lost_date: lostDateGregorian,
      lost_time: lostTime24,
      dealer_id: user.dealer_id
    });

    await createLog(
      user.id,
      'ثبت قطعه از دست رفته',
      `قطعه از دست رفته جدیدی ثبت شد با شناسه ${lostOrderId}`
    );

    await client.query('COMMIT');

    return { status: 201, message: "درخواست قطعه گم‌شده با موفقیت ثبت شد." };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("خطا در ثبت قطعه گم‌شده:", error);
    return { status: 500, message: "خطایی در سرور رخ داد." };
  } finally {
    client.release();
  }
}

module.exports = { addLostOrderService };
