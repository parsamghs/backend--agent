const pool = require('../../../../config/db');
const moment = require('moment-jalaali');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

const createLog = require('../../utils/createlog');
const {
    getOrderById,
    getCustomerById,
    deleteOrderById,
    deleteReceptionById,
    deleteCustomerById,
    updateOrderStatus,
    countOrdersByReceptionId,
    countReceptionsByCustomerId
} = require('../../models/orders/deleteOrderPiece');

const deleteOrderPieceService = async (userId, orderId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const order = await getOrderById(orderId, client);
        if (!order) {
            await client.query('ROLLBACK');
            return { status: 404, message: 'سفارشی با این آیدی یافت نشد.' };
        }

        const customer = await getCustomerById(order.customer_id, client);
        const customerName = customer?.customer_name || 'نامشخص';
        const phoneNumber = customer?.phone_number || null;

        if (order.status === 'حذف شده') {
            await deleteOrderById(orderId, client);

            const remainingOrders = await countOrdersByReceptionId(order.reception_id, client);
            if (remainingOrders === 0) {
                await deleteReceptionById(order.reception_id, client);

                const remainingReceptions = await countReceptionsByCustomerId(order.customer_id, client);
                if (remainingReceptions === 0) {
                    await deleteCustomerById(order.customer_id, client);
                }
            }

            await createLog(
                userId,
                'حذف کامل سفارش',
                `قطعه "${order.piece_name || 'نامشخص'}" به‌صورت کامل از سفارشات مشتری "${customerName}" حذف شد.`,
                phoneNumber
            );

            await client.query('COMMIT');
            return { status: 200, message: 'قطعه قبلاً حذف شده بود و اکنون به‌صورت کامل پاک شد.' };
        } else {
            await updateOrderStatus(orderId, 'حذف شده', client);

            await createLog(
                userId,
                'علامت‌گذاری حذف سفارش',
                `قطعه "${order.piece_name || 'نامشخص'}" از سفارشات مشتری "${customerName}" به عنوان "حذف شده" علامت‌گذاری شد.`,
                phoneNumber
            );

            await client.query('COMMIT');
            return { status: 200, message: 'قطعه با موفقیت به وضعیت "حذف شده ها" تغییر یافت.' };
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('خطا در حذف سفارش:', err);
        return { status: 500, message: 'خطای سرور هنگام حذف سفارش.' };
    } finally {
        client.release();
    }
};

module.exports = { deleteOrderPieceService };
