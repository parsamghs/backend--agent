const pool = require("../../../../config/db");

const searchOrders = async (dealerId, { status, filter, search }) => {
  const cancellationStatuses = [
    'لغو توسط شرکت',
    'عدم پرداخت حسابداری',
    'حذف شده',
    'تحویل نشد',
    'انصراف مشتری',
    'عدم دریافت'
  ];

  let statusCondition = '';
  let values = [];
  let paramIndex = 1;

  const specialStatusMap = {
    "لغو شده ها": {
      condition: () => `AND o.status = ANY($${paramIndex})`,
      values: () => cancellationStatuses
    },
    "بحرانی ها": {
      condition: () => `AND o.estimated_arrival_days <= 0`,
      values: () => null
    },
    "در انتظار تائید حسابداری": {
      condition: () => `AND o.status = ANY($${paramIndex})`,
      values: () => ["در انتظار تائید حسابداری", "پیش درخواست"]
    }
  };

  if (status && status !== 'all') {
    if (specialStatusMap[status]) {
      statusCondition = specialStatusMap[status].condition();
      const vals = specialStatusMap[status].values();
      if (vals) {
        values.push(vals);
        paramIndex++;
      }
    } else {
      statusCondition = `AND o.status = $${paramIndex++}`;
      values.push(status);
    }
  }

  const filtersMap = {
    customer_name: 'c.customer_name',
    phone_number: 'c.phone_number',
    piece_name: 'o.piece_name',
    part_id: 'o.part_id',
    order_number: 'o.order_number',
    car_name: 'o.car_name',
    reception_number: 'r.reception_number',
    chassis_number: 'r.chassis_number'
  };

  let filterCondition = '';
  if (search) {
    if (filter && filtersMap[filter]) {
      filterCondition = `AND ${filtersMap[filter]} ILIKE $${paramIndex++}`;
      values.push(`%${search}%`);
    } else {
      const searchableFields = Object.values(filtersMap);
      const conditions = searchableFields.map(field => {
        values.push(`%${search}%`);
        return `${field} ILIKE $${paramIndex++}`;
      }).join(' OR ');
      filterCondition = `AND (${conditions})`;
    }
  }

  values.push(dealerId);
  const dealerCondition = `AND c.dealer_id = $${paramIndex++}`;

  const query = `
    SELECT 
      o.*, 
      c.customer_name, c.phone_number, 
      r.reception_number, r.reception_date,
      r.car_status, r.chassis_number 
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN receptions r ON o.reception_id = r.id
    WHERE 1=1
    ${statusCondition}
    ${filterCondition}
    ${dealerCondition}
    ORDER BY o.id DESC
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

module.exports = { searchOrders };
