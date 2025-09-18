const pool = require('../../../../config/db');
const {
    getCustomerById,
    getReceptionsByCustomerId,
    getOrdersByReceptionId,
    deleteOrderById,
    updateOrderStatus,
    deleteReceptionById,
    countOrdersByReceptionId,
    countOrdersByCustomerId,
    deleteCustomerById
} = require('../../models/orders/deleteCustomerAndAllOrders');
const createLog = require('../../utils/createlog');

const deleteCustomerAndAllOrdersService = async (user, customerId, dealerId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const customer = await getCustomerById(customerId, client);
        if (!customer) {
            await client.query('ROLLBACK');
            return { status: 404, message: 'مشتری با این شناسه یافت نشد.' };
        }
        if (customer.dealer_id !== dealerId) {
            await client.query('ROLLBACK');
            return { status: 403, message: 'شما اجازه حذف مشتری‌های سایر نمایندگی‌ها را ندارید.' };
        }

        const customerName = customer.customer_name || 'نامشخص';
        const customerPhone = customer.phone_number || null;

        const receptionIds = await getReceptionsByCustomerId(customerId, client);

        for (const receptionId of receptionIds) {
            const orders = await getOrdersByReceptionId(receptionId, client);

            for (const order of orders) {
                if (order.status === 'حذف شده') {
                    await deleteOrderById(order.id, client);

                    const remaining = await countOrdersByReceptionId(receptionId, client);
                    if (remaining === 0) {
                        await deleteReceptionById(receptionId, client);
                    }
                } else {
                    await updateOrderStatus(order.id, 'حذف شده', client);
                }
            }
        }

        const finalOrderCount = await countOrdersByCustomerId(customerId, client);

        let resultMessage;
        if (finalOrderCount === 0) {
            await deleteCustomerById(customerId, client);

            await createLog(
                user.id,
                'حذف مشتری',
                `مشتری "${customerName}" و تمام پذیرش‌ها و قطعات حذف شده کامل پاک شدند.`,
                customerPhone
            );

            resultMessage = 'مشتری، تمام سفارش‌های حذف‌شده و پذیرش‌های مرتبط به‌صورت کامل حذف شدند.';
        } else {
            await createLog(
                user.id,
                'علامت‌گذاری سفارش‌های مشتری',
                `تمام سفارش‌های مشتری "${customerName}" به وضعیت "حذف شده" تغییر یافتند.`,
                customerPhone
            );

            resultMessage = 'تمام سفارش‌های مشتری به وضعیت "حذف شده" تغییر یافتند. مشتری به دلیل داشتن سفارش باقی‌مانده حذف نشد.';
        }

        await client.query('COMMIT');
        return { status: 200, message: resultMessage };

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error in deleteCustomerAndAllOrdersService:', err);
        return { status: 500, message: 'خطای سرور در حذف مشتری و اطلاعات وابسته.' };
    } finally {
        client.release();
    }
};

module.exports = { deleteCustomerAndAllOrdersService };
