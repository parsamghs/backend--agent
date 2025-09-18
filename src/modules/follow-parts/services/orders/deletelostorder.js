const pool = require('../../../../config/db');
const { getLostOrderById, getLostOrderNameById, deleteLostOrderById } = require('../../models/orders/deletelostorder');
const createLog = require('../../utils/createlog');

const deleteLostOrderService = async (userId, lostOrderId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (isNaN(lostOrderId)) {
            return { status: 400, message: 'شناسه قطعه نامعتبر است.' };
        }

        const lostOrder = await getLostOrderById(lostOrderId, client);
        if (!lostOrder) {
            await client.query('ROLLBACK');
            return { status: 404, message: 'قطعه‌ای با این شناسه یافت نشد.' };
        }

        const pieceName = await getLostOrderNameById(lostOrderId, client);

        await deleteLostOrderById(lostOrderId, client);

        await createLog(
            userId,
            'حذف قطعه از دست رفته',
            `قطعه "${pieceName}" از لیست از دست رفته‌ها حذف شد`
        );

        await client.query('COMMIT');
        return { status: 200, message: 'قطعه از دست رفته با موفقیت حذف شد.' };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('خطا در حذف قطعه از دست رفته:', error);
        return { status: 500, message: 'خطا در سرور هنگام حذف قطعه.' };
    } finally {
        client.release();
    }
};

module.exports = { deleteLostOrderService };
