const moment = require('moment-jalaali');
const momentTZ = require('moment-timezone');
const { CONSTANTS } = require('../../utils/constants');
const { insertPartIfNotExists } = require('../../helpers/partshelper');
const { insertCarIfNotExists } = require('../../helpers/carshelper');
const createLog = require('../../utils/createlog');
const { insertReception, getCustomerById, insertOrder } = require('../../models/orders/addPiecesToCustomer');
const pool = require('../../../../config/db');

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

async function addPiecesToCustomerService(user, customer_id, body) {
  if (!customer_id || isNaN(customer_id)) {
    return { status: 400, message: 'شناسه مشتری معتبر نیست.' };
  }

  const { reception_number, reception_date, car_status, car_name, chassis_number, orderer, admissions_specialist, orders } = body;

  if (!reception_number || typeof reception_number !== 'string') {
    return { status: 400, message: 'شماره پذیرش وارد نشده یا معتبر نیست.' };
  }

  if (!reception_date || typeof reception_date !== 'string') {
    return { status: 400, message: 'تاریخ پذیرش وارد نشده یا معتبر نیست.' };
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return { status: 400, message: 'لیست سفارش‌ها خالی یا معتبر نیست.' };
  }

  if (!car_status || !CONSTANTS.car_status.includes(car_status)) {
    return { status: 400, message: `وضعیت خودرو نامعتبر است.` };
  }

  if (!car_name || typeof car_name !== 'string' || car_name.trim().length > 30) {
    return { status: 400, message: 'نام خودرو الزامی است و نباید بیشتر از ۳۰ کاراکتر باشد.' };
  }

  if (chassis_number != null && (typeof chassis_number !== 'string' || chassis_number.trim().length > 20)) {
    return { status: 400, message: 'شماره شاسی نامعتبر است.' };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const formattedReceptionDate = moment(reception_date, 'jYYYY/jMM/jDD', true);
    if (!formattedReceptionDate.isValid()) {
      return { status: 400, message: 'فرمت تاریخ پذیرش صحیح نیست.' };
    }

    const reception_id = await insertReception(client, {
      customer_id,
      reception_number,
      reception_date: formattedReceptionDate.format('YYYY-MM-DD'),
      car_status,
      chassis_number,
      orderer,
      admissions_specialist
    });

    const customer = await getCustomerById(client, customer_id);
    const customerName = customer?.customer_name || 'نامشخص';
    const phoneNumber = customer?.phone_number || null;

    for (const order of orders) {
      const iranTime = moment().tz('Asia/Tehran').format('HH:mm:ss');
      const todayJalali = moment().tz('Asia/Tehran').format('jYYYY/jMM/jDD');
      const orderDateTime = moment(`${todayJalali} ${iranTime}`, 'jYYYY/jMM/jDD HH:mm:ss');
      const orderDateFormatted = orderDateTime.format('YYYY-MM-DD HH:mm:ss');

      if (!CONSTANTS.order_channels.includes(order.order_channel)) {
        return { status: 400, message: `کانال سفارش نامعتبر است.` };
      }

      order.accounting_confirmation = order.accounting_confirmation ?? true;
      const status = order.order_channel === 'بازار آزاد' ? 'در انتظار تائید حسابداری' : 'در انتظار تائید شرکت';
      const estimatedArrivalDate = order.estimated_arrival_days != null
        ? moment(orderDateFormatted).add(order.estimated_arrival_days, 'days').format('YYYY-MM-DD HH:mm:ss')
        : null;

      await insertPartIfNotExists(client, user.category, order.part_id, order.piece_name);
      await insertCarIfNotExists(client, user.category, car_name);

      await insertOrder(client, {
        ...order,
        customer_id,
        reception_id,
        order_date: orderDateFormatted,
        estimated_arrival_date: estimatedArrivalDate,
        status,
        car_name
      });
    }

    await createLog(
      user.id,
      'ثبت پذیرش جدید',
      `پذیرش جدید برای مشتری "${customerName}" به شماره ${reception_number} ثبت شد`,
      phoneNumber
    );

    await client.query('COMMIT');
    return { status: 200, message: 'سفارش‌ها با موفقیت ثبت شدند.' };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ خطای کلی در ثبت سفارش‌ها:', err);
    return { status: 500, message: 'خطای کلی در ثبت سفارش‌ها.', error: err.message };
  } finally {
    client.release();
  }
}

module.exports = { addPiecesToCustomerService };
