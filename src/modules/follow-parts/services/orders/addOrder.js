const moment = require('moment-jalaali');
const momentTZ = require('moment-timezone');
const { insertPartIfNotExists } = require('../../helpers/partshelper');
const { insertCarIfNotExists } = require('../../helpers/carshelper');
const { CONSTANTS } = require('../../utils/constants');
const createLog = require('../../utils/createlog');
const {
  getCustomerByPhone,
  insertCustomer,
  getReceptionByCustomerAndNumber,
  insertReception,
  insertOrder,
  countActiveOrders
} = require('../../models/orders/addOrder');
const pool = require('../../../../config/db');
const { validateJalaliDate, validateWithRegex } = require('../../utils/validation');

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

async function addOrderService(user, orderPayload) {
  if (!user || !user.dealer_id) {
    return { status: 403, message: 'شناسه نمایندگی پیدا نشد.' };
  }

  const client = await pool.connect();
  try {
    const { customer_name, phone_number, reception_number, reception_date, car_status, car_name, chassis_number, orderer, admissions_specialist, orders, order_type } = orderPayload;

    if (!Array.isArray(orders) || orders.length === 0) {
      return { status: 400, message: 'لیست سفارش‌ها نمی‌تواند خالی باشد.' };
    }

    const result = validateWithRegex('phone', phone_number);
    if (!result.isValid) return { status: 400, message: result.message };

    if (!car_name || typeof car_name !== 'string' || car_name.trim().length > 30) {
      return { status: 400, message: 'نام خودرو الزامی است و نباید بیشتر از ۳۰ کاراکتر باشد.' };
    }

    if (chassis_number && chassis_number.trim().length > 40) {
      return { status: 400, message: 'شماره شاسی نباید بیشتر از 40 کاراکتر باشد.' };
    }

    const receptionDateResult = validateJalaliDate(reception_date, 'پذیرش');
    if (!receptionDateResult.isValid) return { status: 400, message: receptionDateResult.message };

    if (!CONSTANTS.car_status.includes(car_status)) {
      return { status: 400, message: `وضعیت خودرو نامعتبر است.` };
    }

    let customerId;
    let customerExists = false;
    const existingCustomer = await getCustomerByPhone(client, phone_number, user.dealer_id);

    if (existingCustomer) {
      customerId = existingCustomer.id;
      customerExists = true;
    } else {
      customerId = await insertCustomer(client, customer_name, phone_number, user.dealer_id);
    }

    let receptionId;
    const existingReception = await getReceptionByCustomerAndNumber(client, customerId, reception_number);
    if (existingReception) {
      receptionId = existingReception.id;
    } else {
      const activeOrdersCount = await countActiveOrders(client, customerId);
      if (activeOrdersCount > 0) {
        return { status: 400, message: 'سفارش‌های قبلی مشتری هنوز فعال هستند.' };
      }

      receptionId = await insertReception(client, {
        reception_date: receptionDateResult.date.format('YYYY-MM-DD'),
        reception_number,
        customer_id: customerId,
        car_status,
        chassis_number,
        orderer,
        admissions_specialist
      });
    }

    await client.query('BEGIN');

    for (const order of orders) {
      const iranTime = moment().tz('Asia/Tehran').format('HH:mm:ss');
      const todayJalali = moment().tz('Asia/Tehran').format('jYYYY/jMM/jDD');
      const orderDateTime = moment(`${todayJalali} ${iranTime}`, 'jYYYY/jMM/jDD HH:mm:ss');
      const orderDateFormatted = orderDateTime.format('YYYY-MM-DD HH:mm:ss');
      const estimatedArrivalDate = orderDateTime.clone().add(order.estimated_arrival_days, 'days').format('YYYY-MM-DD');

      order.accounting_confirmation = order.accounting_confirmation ?? true;
      order.status = order_type === 'pre_order' ? 'پیش درخواست' :
        order.order_channel === 'بازار آزاد' ? 'در انتظار تائید حسابداری' : 'در انتظار تائید شرکت';

      if (!['بازار آزاد', 'شارژ انبار'].includes(order.order_channel)) {
        if (!order.part_id || typeof order.part_id !== 'string' || order.part_id.trim() === '') {
          return { status: 400, message: 'وارد کردن کد قطعه برای سفارش های vis و vor الزامی است' };
        }
      }

      await insertPartIfNotExists(client, user.category, order.part_id, order.piece_name);
      await insertCarIfNotExists(client, user.category, car_name);

      await insertOrder(client, {
        ...order,
        customer_id: customerId,
        reception_id: receptionId,
        order_date: orderDateFormatted,
        estimated_arrival_date: estimatedArrivalDate,
        car_name
      });
    }

    await createLog(
      user.id,
      order_type === 'pre_order' ? 'ثبت پیش‌ درخواست' : 'ثبت سفارش جدید',
      `${order_type === 'pre_order' ? 'پیش درخواست جدیدی' : 'سفارش جدیدی'} با شماره پذیرش ${reception_number} ثبت شد`,
      phone_number
    );

    await client.query('COMMIT');

    return { status: 201, message: 'سفارش‌ها با موفقیت ثبت شدند.', customerExists };

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error in addOrderService:', err);
    return { status: 500, message: 'خطای سرور' };
  } finally {
    client.release();
  }
}

module.exports = { addOrderService };
