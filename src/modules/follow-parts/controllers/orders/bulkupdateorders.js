const pool = require('../../../../config/db');
const { updateMultipleOrderStatusService } = require('../../services/orders/bulkupdateorders');

exports.updateMultipleOrderStatus = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const updatedCount = await updateMultipleOrderStatusService(client, req.user, req.body);
        await client.query('COMMIT');
        res.status(200).json({ message: `${updatedCount} سفارش با موفقیت بروزرسانی شد.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('خطا در تغییر گروهی وضعیت سفارش‌ها:', err);
        res.status(err.status || 500).json({ message: err.message || 'خطا در تغییر وضعیت سفارش‌ها.' });
    } finally {
        client.release();
    }
};
