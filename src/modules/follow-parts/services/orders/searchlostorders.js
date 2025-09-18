const moment = require('moment-jalaali');
const { searchLostOrders: searchLostOrdersModel } = require('../../models/orders/searchlostorders');

const searchLostOrdersService = async (dealerId, options) => {
  const rows = await searchLostOrdersModel(dealerId, options);

  return rows.map(row => {
    return {
      ...row,
      lost_date: row.lost_date ? moment(row.lost_date).format('jYYYY/jMM/jDD') : null,
      lost_time: row.lost_time ? row.lost_time.substring(0, 5) : null
    };
  });
};

module.exports = { searchLostOrdersService };
