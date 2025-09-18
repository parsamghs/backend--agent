const moment = require('moment-jalaali');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const { getLostOrders } = require('../../models/report/lostordersreport');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

const generateLostOrdersReport = async ({ user, query }) => {
  const { from_date, to_date, format } = query;

  if (!from_date || !to_date) throw { status: 400, message: 'تاریخ شروع و پایان الزامی است' };

  const fromDateGregorian = moment(from_date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
  const toDateGregorian = moment(to_date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');

  const rows = await getLostOrders({
    dealerId: user.dealer_id,
    fromDate: fromDateGregorian,
    toDate: toDateGregorian
  });

  const data = rows.map(row => ({
    ...row,
    lost_date: moment(row.lost_date).format('jYYYY/jMM/jDD'),
    lost_time: moment(row.lost_time, 'HH:mm:ss').format('HH:mm')
  }));

  if (format === 'csv') {
    const fields = ['part_id','piece_name','car_name','lost_description','count','lost_date','lost_time','status'];
    const csv = new Parser({ fields }).parse(data);
    return { type: 'csv', content: '\uFEFF' + csv, fileName: `گزارش_قطعات_از_دست_رفته_${from_date}_تا_${to_date}.csv` };
  }

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('گزارش قطعات از دست رفته');

    worksheet.columns = [
      { header: 'نام قطعه', key: 'piece_name', width: 25 },
      { header: 'کد قطعه', key: 'part_id', width: 20 },
      { header: 'تعداد', key: 'count', width: 10 },
      { header: 'کاربرد', key: 'car_name', width: 20 },
      { header: 'تاریخ', key: 'lost_date', width: 15 },
      { header: 'ساعت', key: 'lost_time', width: 15 },
      { header: 'وضعیت', key: 'status', width: 15 },
      { header: 'توضیحات', key: 'lost_description', width: 20 },
    ];

    data.forEach(row => worksheet.addRow(row));

    // استایل‌ها
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    const headerRow = worksheet.getRow(1);
    headerRow.height = 20;
    headerRow.font = { name: 'IranSans', size: 12, bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      row.height = 20;
      row.eachCell(cell => {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.font = { name: 'IranSans', size: 11 };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
    });

    const descColumn = worksheet.getColumn('lost_description');
    let maxLength = 20;
    descColumn.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber === 1) return;
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > maxLength) maxLength = len;
    });
    descColumn.width = Math.min(maxLength + 5, 50);

    return { type: 'excel', workbook, fileName: `گزارش قطعات از دست رفته از ${from_date} تا ${to_date}` };
  }

  throw { status: 400, message: 'فرمت خروجی نامعتبر است (csv یا excel).' };
};

module.exports = { generateLostOrdersReport };
