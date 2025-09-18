const moment = require('moment-jalaali');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });
const {
    getTotalCustomersCount,
    getCustomerIds,
    getOrdersByCustomerIds
} = require('../../models/orders/getAllOrders');

const getAllOrdersService = async (user, query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 200;
    const offset = (page - 1) * limit;
    const status = query.status === 'all' ? null : query.status || null;
    const dealerId = user.dealer_id;

    const canceledStatuses = [
        'لغو توسط شرکت', 'عدم پرداخت حسابداری', 'عدم دریافت',
        'انصراف مشتری', 'تحویل نشد', 'حذف شده'
    ];
    const criticalStatuses = [
        'در انتظار تائید شرکت', 'در انتظار تائید حسابداری', 'در انتظار دریافت',
        'در انتظار نوبت دهی', 'دریافت شد', 'نوبت داده شد'
    ];
    const specialStatuses = (status === "در انتظار تائید حسابداری")
        ? ["در انتظار تائید حسابداری", "پیش درخواست"]
        : status ? [status] : null;

    const totalCustomers = await getTotalCustomersCount(status, dealerId, canceledStatuses, criticalStatuses, specialStatuses);
    const totalPages = Math.ceil(totalCustomers / limit);

    const customerIds = await getCustomerIds(status, dealerId, canceledStatuses, criticalStatuses, specialStatuses, limit, offset);

    if (customerIds.length === 0) {
        return {
            data: [],
            pagination: { currentPage: page, totalPages: 0, totalCustomers: 0, limit }
        };
    }

    const rows = await getOrdersByCustomerIds(customerIds, dealerId, status, canceledStatuses, criticalStatuses, specialStatuses);

    const groupedByCustomer = {};
    rows.forEach(row => {
        const customerId = row.customer_id;
        if (!groupedByCustomer[customerId]) {
            groupedByCustomer[customerId] = {
                customer_id: row.customer_id,
                customer_name: row.customer_name,
                customer_phone: row.customer_phone,
                latest_unreceived_estimated_arrival_date: null,
                earliest_unreceived_estimated_arrival_date: null,
                receptions: []
            };
        }

        const customer = groupedByCustomer[customerId];
        let reception = customer.receptions.find(r => r.reception_id === row.reception_id);
        if (!reception) {
            reception = {
                reception_id: row.reception_id,
                reception_date: row.reception_date ? moment(row.reception_date).format('jYYYY/jMM/jDD HH:mm') : null,
                reception_number: row.reception_number,
                car_status: row.car_status,
                chassis_number: row.chassis_number,
                admissions_specialist: row.admissions_specialist,
                orderer: row.orderer,
                settlement_status: null,
                orders: []
            };
            customer.receptions.push(reception);
        }

        reception.orders.push({
            order_id: row.order_id,
            order_number: row.order_number,
            final_order_number: row.final_order_number,
            order_date: row.order_date ? moment(row.order_date).format('jYYYY/jMM/jDD HH:mm') : null,
            estimated_arrival_date: row.estimated_arrival_date ? moment(row.estimated_arrival_date).format('jYYYY/jMM/jDD HH:mm') : null,
            delivery_date: row.delivery_date ? moment(row.delivery_date).format('jYYYY/jMM/jDD HH:mm') : null,
            piece_name: row.piece_name,
            part_id: row.part_id,
            number_of_pieces: row.number_of_pieces,
            order_channel: row.order_channel,
            market_name: row.market_name,
            market_phone: row.market_phone,
            estimated_arrival_days: row.estimated_arrival_days,
            status: row.status,
            appointment_date: row.appointment_date ? moment(row.appointment_date).format('jYYYY/jMM/jDD') : null,
            appointment_time: row.appointment_time ? row.appointment_time.substring(0,5) : null,
            description: row.description,
            all_description: row.all_description,
            accounting_confirmation: row.accounting_confirmation,
            car_name: row.car_name
        });
    });

    Object.values(groupedByCustomer).forEach(customer => {
        let latestOverallUnreceived = null;
        let earliestOverallUnreceived = null;
        const settledStatuses = [
            "در انتظار نوبت دهی", "تحویل شد", "دریافت شد", "در انتظار دریافت",
            "پرداخت شد", "نوبت داده شد"
        ];

        customer.receptions.forEach(reception => {
            const allSettled = reception.orders.every(order => settledStatuses.includes(order.status));
            reception.settlement_status = allSettled ? "تسویه‌ شده" : "تسویه‌ نشده";

            reception.orders.forEach(order => {
                if ([
                    "در انتظار تائید شرکت",
                    "تائید توسط شرکت",
                    "در انتظار تائید حسابداری",
                    "پرداخت شد",
                    "در انتظار دریافت"
                ].includes(order.status) && order.estimated_arrival_date) {

                    const date = moment(order.estimated_arrival_date, 'jYYYY/jMM/jDD HH:mm');
                    if (!latestOverallUnreceived || date.isAfter(latestOverallUnreceived)) latestOverallUnreceived = date;
                    if (!earliestOverallUnreceived || date.isBefore(earliestOverallUnreceived)) earliestOverallUnreceived = date;
                }
            });
        });

        customer.latest_unreceived_estimated_arrival_date = latestOverallUnreceived ? latestOverallUnreceived.format('jYYYY/jMM/jDD') : null;
        customer.earliest_unreceived_estimated_arrival_date = earliestOverallUnreceived ? earliestOverallUnreceived.format('jYYYY/jMM/jDD') : null;
    });

    return {
        data: Object.values(groupedByCustomer),
        pagination: { currentPage: page, totalPages, totalCustomers, limit }
    };
};

module.exports = { getAllOrdersService };
