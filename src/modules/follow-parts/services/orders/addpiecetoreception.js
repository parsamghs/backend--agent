const moment = require('moment-jalaali');
const momentTZ = require('moment-timezone');
const { CONSTANTS } = require('../../utils/constants');
const { insertPartIfNotExists } = require('../../helpers/partshelper');
const createLog = require('../../utils/createlog');
const { getReceptionById, getCustomerById, getExistingCarName, insertOrder } = require('..//../models/orders/addpiecetoreception');
const pool = require('../../../../config/db');

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

async function addPiecesToExistingReceptionService(user, reception_id, orders) {
  if (!reception_id || isNaN(reception_id)) {
    return { status: 400, message: 'شناسه پذیرش معتبر نیست.' };
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return { status: 400, message: 'لیست سفارش‌ها خالی یا معتبر نیست.' };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reception = await getReceptionById(client, reception_id);
    if (!reception) {
      await client.query('ROLLBACK');
      return { status: 404, message: 'پذیرش با این شناسه یافت نشد.' };
    }

    const { customer_id, reception_number } = reception;
    const customer = await getCustomerById(client, customer_id);
    const customerName = customer?.customer_name || 'نامشخص';
    const phoneNumber = customer?.phone_number || null;

    const existingCarName = await getExistingCarName(client, reception_id);
    if (!existingCarName) {
      await client.query('ROLLBACK');
      return { status: 400, message: 'نام خودرو برای پذیرش مورد نظر یافت نشد.' };
    }

    for (const [index, order] of orders.entries()) {
      if (order.order_channel !== 'VOR' && !order.order_number) {
        await client.query('ROLLBACK');
        return { status: 400, message: `شماره سفارش برای سفارش شماره ${index + 1} الزامی است.` };
      }

      if (
        !order.piece_name ||
        (order.order_channel !== 'بازار آزاد' && !order.part_id) ||
        !order.number_of_pieces ||
        !order.order_channel ||
        !CONSTANTS.order_channels.includes(order.order_channel)
      ) {
        await client.query('ROLLBACK');
        return { status: 400, message: `فیلدهای ضروری سفارش شماره ${index + 1} ناقص یا معتبر نیستند.` };
      }

      order.accounting_confirmation = order.accounting_confirmation ?? true;
      const status = order.order_channel === 'بازار آزاد'
        ? 'در انتظار تائید حسابداری'
        : 'در انتظار تائید شرکت';

      const iranTime = momentTZ().tz('Asia/Tehran').format('HH:mm:ss');
      const todayJalali = momentTZ().tz('Asia/Tehran').format('jYYYY/jMM/jDD');
      const orderDateTime = moment(`${todayJalali} ${iranTime}`, 'jYYYY/jMM/jDD HH:mm:ss');
      const orderDateFormatted = orderDateTime.format('jYYYY/jMM/jDD HH:mm:ss');

      let estimatedArrivalDate = null;
      if (order.estimated_arrival_days != null) {
        estimatedArrivalDate = moment(orderDateFormatted, 'jYYYY/jMM/jDD HH:mm:ss')
          .add(order.estimated_arrival_days, 'days')
          .format('jYYYY/jMM/jDD HH:mm:ss');
      }

      await insertPartIfNotExists(client, user.category, order.part_id, order.piece_name);

      await insertOrder(client, {
        ...order,
        customer_id,
        reception_id,
        order_date: orderDateFormatted,
        estimated_arrival_date: estimatedArrivalDate,
        status,
        car_name: existingCarName
      });
    }

    await createLog(
      user.id,
      'افزودن سفارش به پذیرش',
      `سفارش جدید به پذیرش شماره "${reception_number}" مشتری "${customerName}" اضافه شد.`,
      phoneNumber
    );

    await client.query('COMMIT');
    return { status: 200, message: 'قطعات جدید با موفقیت اضافه شدند.' };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('خطا در افزودن قطعات جدید:', err);
    return { status: 500, message: 'خطا در افزودن قطعات جدید.', error: err.message };
  } finally {
    client.release();
  }
}

module.exports = { addPiecesToExistingReceptionService };
