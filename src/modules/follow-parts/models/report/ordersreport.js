const pool = require("../../../../config/db");

const getOrdersWithFilters = async ({ dealerId, status, dateType, startDate, endDate }) => {
  const canceledStatuses = [
    'لغو توسط شرکت',
    'عدم پرداخت حسابداری',
    'عدم دریافت',
    'انصراف مشتری',
    'تحویل نشد',
    'حذف شده'
  ];

  const criticalStatuses = [
    'در انتظار تائید شرکت',
    'در انتظار تائید حسابداری',
    'در انتظار دریافت',
    'در انتظار نوبت دهی',
    'دریافت شد',
    'نوبت داده شد'
  ];

  const specialStatusMap = {
    "لغو شده ها": {
      condition: (paramIndex) => `AND orders.status = ANY($${paramIndex})`,
      values: () => canceledStatuses
    },
    "بحرانی ها": {
      condition: (paramIndex) => `AND orders.estimated_arrival_days <= 0 AND orders.status = ANY($${paramIndex})`,
      values: () => criticalStatuses
    },
    "در انتظار تائید حسابداری": {
      condition: (paramIndex) => `AND orders.status = ANY($${paramIndex})`,
      values: () => ["در انتظار تائید حسابداری", "پیش درخواست"]
    }
  };

  let filters = `WHERE customers.dealer_id = $1`;
  const values = [dealerId];
  let paramIndex = 2;

  if (status && status !== 'all' && specialStatusMap[status]) {
    const mapEntry = specialStatusMap[status];
    filters += ' ' + mapEntry.condition(paramIndex);
    values.push(mapEntry.values());
    paramIndex++;
  } else if (status && status !== 'all') {
    filters += ` AND orders.status = $${paramIndex++}`;
    values.push(status);
  }

  if (dateType && startDate && endDate) {
    const column = dateType === 'reception_date' ? 'receptions.reception_date' : 'orders.order_date';
    filters += ` AND ${column} BETWEEN $${paramIndex++} AND $${paramIndex++}`;
    values.push(startDate, endDate);
  }

  const query = `
    SELECT 
      customers.customer_name,
      customers.phone_number,
      receptions.reception_number,
      receptions.reception_date,
      receptions.car_status,
      receptions.chassis_number,
      receptions.orderer,
      receptions.admissions_specialist,
      orders.order_number,
      orders.final_order_number,
      orders.piece_name,
      orders.part_id,
      orders.number_of_pieces,
      orders.car_name,
      orders.order_channel,
      orders.market_name,
      orders.market_phone,
      orders.order_date,
      orders.estimated_arrival_days,
      orders.estimated_arrival_date,
      orders.delivery_date,
      orders.appointment_date,
      orders.appointment_time,
      orders.cancellation_date,
      orders.cancellation_time,
      orders.status,
      orders.accounting_confirmation,
      orders.description,
      orders.all_description
    FROM customers
    LEFT JOIN receptions ON receptions.customer_id = customers.id
    LEFT JOIN orders ON orders.reception_id = receptions.id
    ${filters}
    ORDER BY customers.id, receptions.id, orders.id
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

module.exports = { getOrdersWithFilters };
