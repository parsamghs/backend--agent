const moment = require('moment-jalaali');
const momentTZ = require('moment-timezone');
const { getOrderDetails, updateOrders } = require('../../models/orders/bulkupdateorders');
const createLog = require('../../utils/createlog');

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

const mandatoryDescriptionStatuses = [
    'لغو توسط شرکت',
    'عدم پرداخت حسابداری',
    'عدم دریافت',
    'انصراف مشتری',
    'تحویل نشد'
];

const updateMultipleOrderStatusService = async (client, user, body) => {
    const { order_ids, new_status, description, final_order_number, appointment_date, appointment_time } = body;

    if (!Array.isArray(order_ids) || order_ids.length === 0) {
        throw { status: 400, message: 'لیست سفارش‌ها خالی است.' };
    }
    if (!new_status || typeof new_status !== 'string') {
        throw { status: 400, message: 'وضعیت جدید معتبر نیست.' };
    }
    if (mandatoryDescriptionStatuses.includes(new_status) && (!description || description.trim() === '')) {
        throw { status: 400, message: `وارد کردن توضیحات برای وضعیت "${new_status}" الزامی است.` };
    }
    if (new_status === 'نوبت داده شد' && (!appointment_date || !appointment_time || appointment_date.trim() === '' || appointment_time.trim() === '')) {
        throw { status: 400, message: 'وارد کردن تاریخ و ساعت نوبت الزامی است.' };
    }
    if (new_status === 'در انتظار تائید حسابداری' && (!final_order_number || final_order_number.trim() === '')) {
        throw { status: 400, message: 'وارد کردن شماره سفارش نهایی الزامی است.' };
    }

    let convertedAppointmentDate = appointment_date;
    if (new_status === 'نوبت داده شد' && appointment_date) {
        const m = momentTZ.tz(appointment_date, 'jYYYY/jMM/jDD', 'Asia/Tehran');
        if (!m.isValid()) throw { status: 400, message: 'تاریخ نوبت‌دهی معتبر نیست.' };
        convertedAppointmentDate = m.format('YYYY-MM-DD');
    }

    const orderDetails = await getOrderDetails(order_ids);
    if (orderDetails.length === 0) {
        throw { status: 404, message: 'هیچ سفارشی یافت نشد.' };
    }

    const customerGroupsWithPhone = {};
    for (const row of orderDetails) {
        const customerName = row.customer_name;
        const phoneNumber = row.phone_number || null;
        if (!customerGroupsWithPhone[customerName]) {
            customerGroupsWithPhone[customerName] = { pieces: [], phone: phoneNumber };
        }
        customerGroupsWithPhone[customerName].pieces.push(row.piece_name || 'نامشخص');
    }

    const deliveryDate = new_status === 'دریافت شد'
        ? moment().tz('Asia/Tehran').format('YYYY-MM-DD HH:mm')
        : null;

    const isAppointmentStatus = new_status === 'نوبت داده شد';

    const updateResult = await updateOrders({
        client,
        orderIds: order_ids,
        newStatus: new_status,
        description,
        deliveryDate,
        finalOrderNumber: final_order_number?.trim() || null,
        convertedAppointmentDate,
        appointmentTime,
        isAppointmentStatus
    });

    for (const [customerName, data] of Object.entries(customerGroupsWithPhone)) {
        const piecesText = data.pieces.map(name => `«${name}»`).join('، ');
        const phone = data.phone;
        let logMessage = `وضعیت سفارشات ${piecesText} مربوط به مشتری "${customerName}" به "${new_status}" تغییر یافت`;
        await createLog(user.id, 'به‌روزرسانی گروهی سفارش‌ها', logMessage, phone);
    }

    return updateResult.rowCount;
};

module.exports = {
    updateMultipleOrderStatusService
};
