const moment = require('moment-jalaali');
const ExcelJS = require('exceljs');
const { getOrdersWithFilters } = require('../../models/report/ordersreport');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

const exportOrdersExcelService = async ({ user, query }) => {
  const dealerId = user.dealer_id;
  const startDate = query.start_date ? moment(query.start_date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : null;
  const endDate = query.end_date ? moment(query.end_date, 'jYYYY/jMM/jDD').endOf('day').format('YYYY-MM-DD') : null;

  const rows = await getOrdersWithFilters({
    dealerId,
    status: query.status,
    dateType: query.date_type,
    startDate,
    endDate
  });

  const canceledStatuses = [
    'لغو توسط شرکت',
    'عدم پرداخت حسابداری',
    'عدم دریافت',
    'انصراف مشتری',
    'تحویل نشد',
    'حذف شده'
  ];

  const safeValue = (value) => value ?? '—';
  const workbook = new ExcelJS.Workbook();

  // sheets: مشتری، پذیرش، سفارشات
  const customerSheet = workbook.addWorksheet('اطلاعات مشتری');
  customerSheet.columns = [
    { header: 'نام مشتری', key: 'customer_name' },
    { header: 'شماره تلفن', key: 'phone_number' }
  ];

  const receptionSheet = workbook.addWorksheet('اطلاعات پذیرش');
  receptionSheet.columns = [
    { header: 'نام مشتری', key: 'customer_name' },
    { header: 'شماره پذیرش', key: 'reception_number' },
    { header: 'تاریخ پذیرش', key: 'reception_date' },
    { header: 'وضعیت خودرو', key: 'car_status' },
    { header: 'شماره شاسی', key: 'chassis_number' },
    { header: 'کارشناس پذیرش', key: 'admissions_specialist' },
    { header: 'سفارش‌ دهنده', key: 'orderer' }
  ];

  const orderSheet = workbook.addWorksheet('اطلاعات سفارشات');
  orderSheet.columns = [
    { header: 'نام مشتری', key: 'customer_name' },
    { header: 'شماره پذیرش', key: 'reception_number' },
    { header: 'شماره سفارش', key: 'order_number' },
    { header: 'شماره حواله', key: 'final_order_number' },
    { header: 'نام قطعه', key: 'piece_name' },
    { header: 'کد قطعه', key: 'part_id' },
    { header: 'تعداد', key: 'number_of_pieces' },
    { header: 'نام خودرو', key: 'car_name' },
    { header: 'کانال سفارش', key: 'order_channel' },
    { header: 'نام بازار', key: 'market_name' },
    { header: 'تلفن بازار', key: 'market_phone' },
    { header: 'تاریخ سفارش', key: 'order_date' },
    { header: 'روز تحویل', key: 'estimated_arrival_days' },
    { header: 'تاریخ تخمینی رسیدن', key: 'estimated_arrival_date' },
    { header: 'تاریخ تحویل', key: 'delivery_date' },
    { header: 'تاریخ نوبت‌دهی', key: 'appointment_date' },
    { header: 'ساعت نوبت‌دهی', key: 'appointment_time' },
    { header: 'تاریخ لغو', key: 'cancellation_date' },
    { header: 'ساعت لغو', key: 'cancellation_time' },
    { header: 'وضعیت', key: 'status' },
    { header: 'تأیید حسابداری', key: 'accounting_confirmation' },
    { header: 'توضیحات لغو', key: 'description' },
    { header: 'توضیحات کلی', key: 'all_description' }
  ];

  const customersSeen = new Set();
  const receptionsSeen = new Set();

  rows.forEach(row => {
    if (!customersSeen.has(row.phone_number)) {
      customersSeen.add(row.phone_number);
      customerSheet.addRow({
        customer_name: safeValue(row.customer_name),
        phone_number: safeValue(row.phone_number)
      });
    }

    if (row.reception_number && !receptionsSeen.has(row.reception_number)) {
      receptionsSeen.add(row.reception_number);
      receptionSheet.addRow({
        reception_number: safeValue(row.reception_number),
        reception_date: safeValue(row.reception_date ? moment(row.reception_date).format('jYYYY/jMM/jDD') : null),
        car_status: safeValue(row.car_status),
        chassis_number: safeValue(row.chassis_number),
        orderer: safeValue(row.orderer),
        admissions_specialist: safeValue(row.admissions_specialist),
        customer_name: safeValue(row.customer_name)
      });
    }

    orderSheet.addRow({
      ...row,
      customer_name: safeValue(row.customer_name),
      reception_number: safeValue(row.reception_number),
      order_date: row.order_date ? moment(row.order_date).format('jYYYY/jMM/jDD HH:mm') : '—',
      estimated_arrival_date: row.estimated_arrival_date ? moment(row.estimated_arrival_date).format('jYYYY/jMM/jDD') : '—',
      delivery_date: row.delivery_date ? moment(row.delivery_date).format('jYYYY/jMM/jDD HH:mm') : '—',
      appointment_date: row.appointment_date ? moment(row.appointment_date).format('jYYYY/jMM/jDD') : '—',
      appointment_time: row.appointment_time ? row.appointment_time.substring(0, 5) : '—',
      cancellation_date: row.cancellation_date ? moment(row.cancellation_date).format('jYYYY/jMM/jDD') : '—',
      cancellation_time: row.cancellation_time ? row.cancellation_time.substring(0, 5) : '—',
      status: safeValue(row.status),
      accounting_confirmation: row.accounting_confirmation === true || row.accounting_confirmation === 'TRUE' ? '☑' : '☐'
    });
  });

  return { workbook, dealerName: user.dealer_name, dealerId: dealerId, startDate: query.start_date, endDate: query.end_date, canceledStatuses };
};

module.exports = { exportOrdersExcelService };
