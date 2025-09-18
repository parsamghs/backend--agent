const moment = require('moment-jalaali');
const ExcelJS = require('exceljs');
const { getLogs } = require('../../models/report/logsreport');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

const exportLogsToExcel = async ({ user, query }) => {
  if (user.role !== 'مدیریت') throw { status: 403, message: 'دسترسی غیرمجاز' };

  const { start_date, end_date, user_name } = query;

  const startDateMiladi = start_date ? moment(start_date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : null;
  const endDateMiladi = end_date ? moment(end_date, 'jYYYY/jMM/jDD').endOf('day').format('YYYY-MM-DD') : null;

  const logs = await getLogs({
    dealerId: user.dealer_id,
    startDate: startDateMiladi,
    endDate: endDateMiladi,
    userName: user_name
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('سوابق فعالیت');

  sheet.columns = [
    { header: 'نام کاربر', key: 'user_name', width: 25 },
    { header: 'عملیات', key: 'action', width: 25 },
    { header: 'پیام', key: 'message', width: 20 },
    { header: 'تاریخ', key: 'date', width: 15 },
    { header: 'ساعت', key: 'time', width: 10 },
    { header: "شماره تلفن", key: 'phone_number', width: 20 }
  ];

  logs.forEach(row => {
    const localMoment = moment(row.log_time).tz('Asia/Tehran');
    sheet.addRow({
      user_name: row.user_name,
      action: row.action,
      message: row.message,
      date: localMoment.format('jYYYY/jMM/jDD'),
      time: localMoment.format('HH:mm'),
      phone_number: row.phone_number
    });
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  const headerRow = sheet.getRow(1);
  headerRow.height = 20;
  headerRow.font = { name: 'IranSans', size: 12, bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.eachCell(cell => {
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    let maxLines = 1;
    row.eachCell(cell => {
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.font = { name: 'IranSans', size: 11 };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

      if (cell.value) {
        const lines = cell.value.toString().split('\n').length;
        const approxLines = Math.ceil(cell.value.toString().length / 50);
        maxLines = Math.max(maxLines, lines, approxLines);
      }
    });
    row.height = maxLines * 20;
  });

  const messageColumn = sheet.getColumn('message');
  let maxLength = 20;
  messageColumn.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    if (rowNumber === 1) return;
    const cellValue = cell.value ? cell.value.toString() : '';
    if (cellValue.length > maxLength) maxLength = cellValue.length;
  });
  messageColumn.width = Math.min(maxLength + 5, 100);

  let fileName = `سوابق فعالیت`;
  if (user_name) fileName += ` "${user_name}"`;
  if (start_date && end_date) fileName += ` از ${start_date} تا ${end_date}`;

  return { workbook, fileName };
};

module.exports = { exportLogsToExcel };
