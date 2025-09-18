const { getDealerById } = require('../../models/dealers/getremainingsubscription');

async function getRemainingSubscriptionService(dealer_id) {
  if (!dealer_id) {
    return { status: 403, message: 'شما به نمایندگی‌ای اختصاص داده نشده‌اید.' };
  }

  const dealer = await getDealerById(dealer_id);

  if (!dealer) {
    return { status: 404, message: 'نمایندگی یافت نشد.' };
  }

  return {
    status: 200,
    data: {
      dealer_id,
      dealer_name: dealer.dealer_name,
      dealer_code: dealer.dealer_code,
      remaining_subscription: dealer.remaining_subscription,
    }
  };
}

module.exports = { getRemainingSubscriptionService };
