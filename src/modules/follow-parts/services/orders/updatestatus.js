const moment = require('moment-jalaali');
const momentTZ = require('moment-timezone');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

const { getOrderById, updateOrderInDB, insertLostOrder } = require('../../models/orders/updatestatus');
const createLog = require('../../utils/createlog');

const updateOrderStatus = async (user, orderId, data) => {
  const order = await getOrderById(orderId);
  if (!order) throw { status: 404, message: 'سفارشی با این شناسه یافت نشد.' };

  const userRole = user?.role;
  const successMessages = [];
  const errorMessages = [];

  let newStatus = null;
  let newDeliveryDate = null;
  let newDescription = null;
  let newAllDescription = null;
  let newAppointmentDate = null;
  let newAppointmentTime = null;
  let newCancellationDate = null;
  let newCancellationTime = null;
  let newFinalOrderNumber = null;

  const canEditStatus = ['پذیرش', 'انباردار', 'حسابدار', 'مدیریت'].includes(userRole);
  const canEditAllDescription = ['مدیریت', 'انباردار', 'پذیرش', 'حسابدار'].includes(userRole);

  if ((data.status === 'دریافت شد' || data.status === 'در انتظار نوبت دهی') && canEditStatus) {
    newDeliveryDate = moment().tz('Asia/Tehran').format('YYYY/MM/DD hh:mm');
    successMessages.push('تاریخ تحویل به‌صورت خودکار ثبت شد.');
  }

  if (data.status !== undefined) {
    if (canEditStatus) {
      newStatus = data.status;
      successMessages.push('وضعیت قطعه با موفقیت تغییر کرد.');
    } else {
      errorMessages.push('شما اجازه تغییر وضعیت قطعه را ندارید.');
    }

    if (['لغو توسط شرکت', 'عدم پرداخت حسابداری'].includes(newStatus)) {
      const now = momentTZ().tz('Asia/Tehran');
      newCancellationDate = now.format('YYYY/MM/DD');
      newCancellationTime = now.format('hh:mm');
      newDescription = data.description?.trim() || 'بدون توضیحات';

      await insertLostOrder({
        part_id: order.part_id,
        piece_name: order.piece_name,
        car_name: order.car_name,
        lost_description: newDescription,
        count: order.number_of_pieces?.toString(),
        lost_date: now.format('YYYY-MM-DD'),
        lost_time: now.format('HH:mm'),
        status: newStatus,
        dealer_id: user.dealer_id
      });
    }
  }

  if (data.status === 'در انتظار تائید حسابداری' && (!data.final_order_number || data.final_order_number.trim() === '')) {
    throw { status: 400, message: 'وارد کردن شماره سفارش نهایی الزامی است.' };
  }
  if (data.final_order_number) newFinalOrderNumber = data.final_order_number.trim();

  if (data.all_description && canEditAllDescription) {
    newAllDescription = data.all_description;
    successMessages.push('توضیحات کلی با موفقیت به‌روزرسانی شد');
  } else if (data.all_description) {
    errorMessages.push('شما اجازه ویرایش توضیحات کلی را ندارید.');
  }

  const mandatoryDescriptionStatuses = ['انصراف مشتری', 'عدم دریافت', 'تحویل نشد', 'لغو توسط شرکت', 'عدم تائید حسابداری'];
  if (newStatus && mandatoryDescriptionStatuses.includes(newStatus) && (!data.description || data.description.trim() === '')) {
    throw { status: 400, message: `وارد کردن توضیحات برای وضعیت "${newStatus}" الزامی است.` };
  }
  if (newStatus && mandatoryDescriptionStatuses.includes(newStatus)) newDescription = data.description.trim();

  if (newStatus === 'نوبت داده شد') {
    if (!data.appointment_date || !data.appointment_time) {
      throw { status: 400, message: 'وارد کردن تاریخ و ساعت نوبت برای وضعیت "نوبت داده شد" الزامی است.' };
    }
    const isValidJalaliDate = moment(data.appointment_date, 'jYYYY/jMM/jDD', true).isValid();
    const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(data.appointment_time.trim());
    if (!isValidJalaliDate || !isValidTime) {
      throw { status: 400, message: 'فرمت تاریخ یا ساعت نوبت نامعتبر است. فرمت صحیح تاریخ: ۱۴۰۳/۰۴/۲۰، ساعت: 14:30' };
    }
    newAppointmentDate = moment(data.appointment_date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
    newAppointmentTime = data.appointment_time.trim();
  }

  const updatedRows = await updateOrderInDB({
    id: orderId,
    status: newStatus,
    delivery_date: newDeliveryDate,
    description: newDescription,
    all_description: newAllDescription,
    appointment_date: newAppointmentDate,
    appointment_time: newAppointmentTime,
    cancellation_date: newCancellationDate,
    cancellation_time: newCancellationTime,
    final_order_number: newFinalOrderNumber
  });

  if (updatedRows === 0) throw { status: 404, message: `سفارشی با شناسه ${orderId} یافت نشد یا تغییر نکرد.` };

  let logMessage = `سفارش مشتری "${order.customer_name}" ویرایش شد`;
  if (newAllDescription) {
    logMessage = `توضیحات "${newAllDescription}" به سفارش ${order.piece_name || 'نامشخص'} مربوط به مشتری ${order.customer_name} اضافه شد`;
  } else if (newStatus) {
    const pieceName = order.piece_name || 'نامشخص';
    const customerName = order.customer_name;
    const description = newDescription || 'بدون توضیحات';

    switch (newStatus) {
      case 'در انتظار تائید حسابداری':
        logMessage = `سفارش قطعه‌ی "${pieceName}" مربوط به مشتری "${customerName}" توسط شرکت تأیید شد و در انتظار تائید حسابداری است`;
        break;
      case 'لغو توسط شرکت':
        logMessage = `سفارش قطعه‌ی "${pieceName}" مربوط به مشتری "${customerName}" به دلیل "${description}" توسط شرکت لغو شد`;
        break;
      case 'در انتظار دریافت':
        logMessage = `سفارش "${pieceName}" مشتری "${customerName}" توسط حسابداری پرداخت شد و در انتظار دریافت است`;
        break;
      case 'عدم پرداخت حسابداری':
        logMessage = `سفارش قطعه‌ی "${pieceName}" مربوط به مشتری "${customerName}" به دلیل "${description}" توسط حسابدار پرداخت نشد`;
        break;
      case 'در انتظار نوبت دهی':
        logMessage = `سفارش قطعه‌ی "${pieceName}" مربوط به مشتری "${customerName}" توسط انباردار دریافت شد و در انتظار نوبت دهی است`;
        break;
      case 'دریافت شد':
        logMessage = `سفارش "${pieceName}" مشتری "${customerName}" توسط انباردار دریافت شد`;
        break;
      case 'عدم دریافت':
        logMessage = `سفارش قطعه‌ی "${pieceName}" مربوط به مشتری "${customerName}" به دلیل "${description}" دریافت نگردید`;
        break;
      case 'نوبت داده شد':
        const appointmentShamsi = newAppointmentDate
          ? moment(newAppointmentDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD')
          : 'نامشخص';
        const appointmentTime = newAppointmentTime || 'نامشخص';
        logMessage = `برای سفارش قطعه "${pieceName}" مربوط به مشتری "${customerName}" در تاریخ "${appointmentShamsi}" ساعت "${appointmentTime}" نوبت گذاری شد`;
        break;
      case 'انصراف مشتری':
        logMessage = `مشتری "${customerName}" از ادامه‌ی سفارش "${pieceName}" به دلیل "${description}" انصراف داد`;
        break;
      case 'تحویل شد':
        logMessage = `سفارش قطعه‌ی "${pieceName}" مربوط به مشتری "${customerName}" تحویل داده شد`;
        break;
      case 'تحویل نشد':
        logMessage = `سفارش "${pieceName}" مشتری "${customerName}" به دلیل "${description}" تحویل نشد`;
        break;
      default:
        logMessage = `سفارش مشتری "${customerName}" ویرایش شد`;
    }
  }

  await createLog(user.id, 'به‌روزرسانی سفارش', logMessage, order.phone_number || null);

  return { successMessages, errorMessages };
};

module.exports = { updateOrderStatus };
