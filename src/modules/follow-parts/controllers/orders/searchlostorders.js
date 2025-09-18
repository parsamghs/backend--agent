const moment = require('moment-jalaali');
const { searchLostOrdersService } = require('../../services/orders/searchlostorders');

exports.searchLostOrders = async (req, res) => {
  try {
    const dealerId = req.user.dealer_id;
    const { search, filter, date } = req.query;

    if (date) {
      const validDate = moment(date, 'YYYY-MM-DD', true).isValid();
      if (!validDate) {
        return res.status(400).json({ message: "تاریخ وارد شده معتبر نیست. فرمت باید YYYY-MM-DD باشد." });
      }
    }

    const data = await searchLostOrdersService(dealerId, { search, filter, date });

    return res.json({
      data,
      total: data.length
    });
  } catch (error) {
    console.error("خطا در جستجوی قطعات گم‌شده:", error);
    return res.status(500).json({
      message: "خطا در دریافت اطلاعات جستجو شده.",
    });
  }
};
