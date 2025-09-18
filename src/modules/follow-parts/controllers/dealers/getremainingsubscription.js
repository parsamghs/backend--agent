const { getRemainingSubscriptionService } = require('../../services/dealers/getremainingsubscription');

async function getRemainingSubscription(req, res) {
  const { dealer_id } = req.user;

  const result = await getRemainingSubscriptionService(dealer_id);

  if (result.status === 200) {
    return res.status(200).json(result.data);
  } else {
    return res.status(result.status).json({ message: result.message });
  }
}

module.exports = { getRemainingSubscription };
