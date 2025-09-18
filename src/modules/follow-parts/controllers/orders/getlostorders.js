const { getLostOrdersService } = require('../../services/orders/getlostorders');

exports.getLostOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const dealerId = req.user.dealer_id;

        const result = await getLostOrdersService(dealerId, page, pageSize);
        res.json(result);
    } catch (error) {
        console.error("خطا در دریافت قطعات گم‌شده:", error);
        res.status(500).json({
            message: "خطا در دریافت اطلاعات قطعات گم‌شده."
        });
    }
};
