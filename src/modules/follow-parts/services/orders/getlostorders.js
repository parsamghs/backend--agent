const moment = require('moment-jalaali');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });
const { getLostOrdersFromDB, countLostOrdersFromDB } = require('../../models/orders/getlostorders');

const getLostOrdersService = async (dealerId, page = 1, pageSize = 20) => {
    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 20;
    const offset = (page - 1) * pageSize;

    const rows = await getLostOrdersFromDB(dealerId, pageSize, offset);

    const data = rows.map(row => {
        return {
            ...row,
            lost_date: row.lost_date ? moment(row.lost_date).format('jYYYY/jMM/jDD') : null,
            lost_time: row.lost_time ? row.lost_time.substring(0, 5) : null
        };
    });

    const total = await countLostOrdersFromDB(dealerId);

    return {
        data,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
    };
};

module.exports = { getLostOrdersService };
