const { searchOrders: searchOrdersModel } = require('../../models/orders/searchorders');

const searchOrdersService = async (dealerId, options) => {
  const rows = await searchOrdersModel(dealerId, options);

  const groupedData = {};
  for (const row of rows) {
    const customerId = row.customer_id;
    if (!groupedData[customerId]) {
      groupedData[customerId] = {
        customer_id: row.customer_id,
        customer_name: row.customer_name,
        customer_phone: row.phone_number,
        receptions: []
      };
    }

    const customer = groupedData[customerId];
    const receptionId = row.reception_id;

    let reception = customer.receptions.find(r => r.reception_id === receptionId);
    if (!reception) {
      reception = {
        reception_id: row.reception_id,
        reception_date: formatDateTime(row.reception_date),
        reception_number: row.reception_number,
        car_status: row.car_status || null,
        chassis_number: row.chassis_number || null,
        settlement_status: row.settlement_status || 'تسویه‌ نشده',
        orders: []
      };
      customer.receptions.push(reception);
    }

    reception.orders.push({
      order_id: row.id,
      order_number: row.order_number,
      final_order_number: row.final_order_number,
      order_date: formatDateTime(row.order_date),
      estimated_arrival_date: formatDateTime(row.estimated_arrival_date),
      delivery_date: row.delivery_date ? formatDateTime(row.delivery_date) : null,
      piece_name: row.piece_name,
      part_id: row.part_id,
      number_of_pieces: row.number_of_pieces,
      order_channel: row.order_channel,
      market_name: row.market_name,
      market_phone: row.market_phone,
      estimated_arrival_days: row.estimated_arrival_days,
      status: row.status,
      appointment_date: row.appointment_date,
      appointment_time: row.appointment_time,
      description: row.description,
      all_description: row.all_description,
      car_name: row.car_name
    });
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('fa-IR-u-nu-latn') + ' ' +
           d.toLocaleTimeString('fa-IR-u-nu-latn', { hour: '2-digit', minute: '2-digit' });
  }

  return Object.values(groupedData);
};

module.exports = { searchOrdersService };
