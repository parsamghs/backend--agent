const pool = require('../../../../config/db');
const { updateCustomer, updateReception, updateOrder } = require('../../models/orders/UpdateCustomer');
const { CONSTANTS } = require('../../utils/constants');
const { validateJalaliDate, validateWithRegex } = require('../../utils/validation');
const createLog = require('../../utils/createlog');

const updateOrderService = async (userId, customerId, { customer, reception, order, reception_id }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let updatedCustomer = null;
    let updatedReception = null;

    // بروزرسانی مشتری
    if (customer) {
      if (customer.phone_number) {
        const result = validateWithRegex('phone', customer.phone_number);
        if (!result.isValid) throw new Error(result.message);
      }
      updatedCustomer = await updateCustomer(customerId, customer, client);
    }

    // بروزرسانی پذیرش
    if (reception) {
      if (reception.reception_date) {
        const result = validateJalaliDate(reception.reception_date, 'پذیرش');
        if (!result.isValid) throw new Error(result.message);
        reception.reception_date = result.date.format('YYYY-MM-DD');
      }

      if (reception.car_status && !CONSTANTS.car_status.includes(reception.car_status)) {
        throw new Error(`وضعیت خودرو نامعتبر است. باید یکی از این گزینه‌ها باشد: ${CONSTANTS.car_status.join('، ')}`);
      }

      updatedReception = await updateReception(customerId, reception.reception_id, reception, client);
    }

    // بروزرسانی سفارش
    if (order) {
      if (order.number_of_pieces !== undefined && (!Number.isInteger(order.number_of_pieces) || order.number_of_pieces <= 0)) {
        throw new Error('تعداد قطعات باید عدد صحیح مثبت باشد.');
      }

      if (order.order_channel && !CONSTANTS.order_channels.includes(order.order_channel)) {
        throw new Error(`کانال سفارش نامعتبر است. باید یکی از این گزینه‌ها باشد: ${CONSTANTS.order_channels.join('، ')}`);
      }

      ['order_date', 'estimated_arrival_date', 'appointment_date'].forEach(key => {
        if (order[key]) {
          const result = validateJalaliDate(order[key], key);
          if (!result.isValid) throw new Error(result.message);
          order[key] = result.date.format('YYYY-MM-DD');
        }
      });

      const finalReceptionId = reception?.reception_id || reception_id;
      if (!finalReceptionId) throw new Error('شناسه پذیرش لازم است.');

      const updatedOrder = await updateOrder(customerId, finalReceptionId, order.order_id, order, client);
      if (!updatedOrder) throw new Error('سفارشی با این شناسه پیدا نشد.');

      await createLog(
        userId,
        'ویرایش اطلاعات مشتری',
        `اطلاعات سفارش "${updatedOrder.piece_name}" به شماره پذیرش "${updatedReception?.reception_number || finalReceptionId}" مربوط به مشتری "${updatedCustomer?.customer_name}" ویرایش شد`,
        updatedCustomer?.phone_number
      );
    }

    await client.query('COMMIT');
    return { customer: updatedCustomer, reception: updatedReception };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { updateOrderService };
