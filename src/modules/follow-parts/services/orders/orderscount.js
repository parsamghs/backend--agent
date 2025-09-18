const moment = require('moment-jalaali');
const { 
    getStatusCountsFromDB, 
    getCanceledCountFromDB, 
    getCriticalCountFromDB } = require('../../models/orders/orderscount');

const getOrdersCountsService = async (dealerId, start_date, end_date) => {
    if (start_date) start_date = moment(start_date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
    if (end_date) end_date = moment(end_date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');

    const specialStatuses = ["در انتظار تائید حسابداری", "پیش درخواست"];
    const statuses = [
        'در انتظار تائید شرکت',
        ...specialStatuses,
        'در انتظار دریافت',
        'دریافت شد',
        'در انتظار نوبت دهی',
        'نوبت داده شد',
        'تحویل شد'
    ];
    const canceledStatuses = [
        'لغو توسط شرکت',
        'عدم پرداخت حسابداری',
        'حذف شده',
        'تحویل نشد',
        'انصراف مشتری',
        'عدم دریافت'
    ];
    const criticalStatuses = [
        'در انتظار تائید شرکت',
        'در انتظار تائید حسابداری',
        'در انتظار دریافت',
        'در انتظار نوبت دهی',
        'دریافت شد',
        'نوبت داده شد'
    ];

    const statusCounts = await getStatusCountsFromDB(statuses, dealerId, start_date, end_date);
    const canceledCount = await getCanceledCountFromDB(canceledStatuses, dealerId, start_date, end_date);
    const criticalCount = await getCriticalCountFromDB(dealerId, criticalStatuses, start_date, end_date);

    const stats = {
        'در انتظار تائید شرکت': 0,
        'در انتظار تائید حسابداری': 0,
        'در انتظار دریافت': 0,
        'دریافت شد': 0,
        'در انتظار نوبت دهی': 0,
        'نوبت داده شد': 0,
        'تحویل شد': 0,
        'بحرانی': criticalCount,
        'لغو شده': canceledCount
    };

    statusCounts.forEach(row => {
        stats[row.status] = parseInt(row.count);
    });

    if (stats['پیش درخواست']) {
        stats['در انتظار تائید حسابداری'] += stats['پیش درخواست'];
        delete stats['پیش درخواست'];
    }

    return stats;
};

module.exports = { getOrdersCountsService };
