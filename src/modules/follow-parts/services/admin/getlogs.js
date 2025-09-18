const pool = require('../../../../config/db');
const moment = require('moment-jalaali');
const momentTZ = require('moment-timezone');
const { countLogs, fetchLogs } = require('../../models/admin/getlogs');

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

async function getLogsService(userRole, dealerId, query) {
  if (userRole !== 'مدیریت') {
    return { status: 403, data: { error: 'دسترسی غیرمجاز' } };
  }

  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 300;
    const offset = (page - 1) * limit;

    const { start_date, end_date, user_name } = query;

    const startDateMiladi = start_date
      ? moment(start_date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD')
      : null;
    const endDateMiladi = end_date
      ? moment(end_date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD')
      : null;

    const params = [];
    const whereClauses = [];

    if (dealerId) {
      params.push(dealerId);
      whereClauses.push(`dealer_id = $${params.length}`);
    }
    if (startDateMiladi) {
      params.push(startDateMiladi);
      whereClauses.push(`log_time >= $${params.length}`);
    }
    if (endDateMiladi) {
      params.push(endDateMiladi);
      whereClauses.push(`log_time <= $${params.length}`);
    }
    if (user_name) {
      params.push(`%${user_name}%`);
      whereClauses.push(`user_name ILIKE $${params.length}`);
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const totalLogs = await countLogs(pool, whereSQL, params);
    const totalPages = Math.ceil(totalLogs / limit);

    const rows = await fetchLogs(pool, whereSQL, params, limit, offset);

    const logs = rows.map((log) => {
      const localMoment = momentTZ(log.log_time).tz('Asia/Tehran');
      return {
        action: log.action,
        message: log.message,
        user_name: log.user_name,
        date: localMoment.format('jYYYY/jMM/jDD'),
        time: localMoment.format('HH:mm'),
        phone_number: log.phone_number,
      };
    });

    return {
      status: 200,
      data: { page, limit, totalLogs, totalPages, logs },
    };
  } catch (err) {
    console.error('خطا در دریافت لاگ‌ها:', err);
    return { status: 500, data: { error: 'خطای سرور در دریافت لاگ‌ها' } };
  }
}

module.exports = { getLogsService };
