const moment = require('moment-jalaali');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

const { getLostOrderById, updateLostOrderInDB } = require('../../models/orders/updatelostorder');
const createLog = require('../../utils/createlog');

const updateLostOrder = async (user, id, data) => {
  const existing = await getLostOrderById(id);
  if (!existing) throw { status: 404, message: 'قطعه‌ای با این شناسه یافت نشد یا قبلاً حذف شده است.' };

  if (data.piece_name !== undefined && data.piece_name.trim() === '') {
    throw { status: 400, message: 'نام قطعه نمی‌تواند خالی باشد.' };
  }

  if (data.car_name !== undefined && data.car_name.trim() === '') {
    throw { status: 400, message: 'نام خودرو نمی‌تواند خالی باشد.' };
  }

  if (data.count !== undefined && !/^\d+$/.test(data.count)) {
    throw { status: 400, message: 'فیلد count باید فقط شامل عدد باشد.' };
  }

  let miladiDate = null;
  if (data.lost_date) {
    const isValidJalali = moment(data.lost_date, ['jYYYY/jMM/jDD', 'jYYYY-MM-DD'], true).isValid();
    if (!isValidJalali) throw { status: 400, message: 'فرمت تاریخ واردشده نامعتبر است. مثلاً: ۱۴۰۳/۰۴/۲۰' };
    miladiDate = moment(data.lost_date, ['jYYYY/jMM/jDD', 'jYYYY-MM-DD']).format('YYYY-MM-DD');
  }

  let formattedTime = null;
  if (data.lost_time) {
    const isValidTime = moment(data.lost_time, ['HH:mm', 'hh:mm A', 'hh:mm:ss A'], true).isValid();
    if (!isValidTime) throw { status: 400, message: 'فرمت ساعت واردشده نامعتبر است. مثلاً: 14:30' };
    formattedTime = moment(data.lost_time, ['HH:mm', 'hh:mm A', 'hh:mm:ss A']).format('HH:mm:ss');
  }

  await updateLostOrderInDB({
    id,
    part_id: data.part_id,
    piece_name: data.piece_name,
    car_name: data.car_name,
    lost_description: data.lost_description,
    count: data.count,
    lost_date: miladiDate,
    lost_time: formattedTime
  });

  await createLog(
    user.id,
    'ویرایش قطعه از دست رفته',
    `قطعه از دست رفته "${existing.piece_name || 'نامشخص'}" ویرایش شد`
  );

  return { message: 'قطعه با موفقیت به‌روزرسانی شد.' };
};

module.exports = { updateLostOrder };
