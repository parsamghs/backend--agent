const { getSettingByDealerId } = require('../../models/setting/getsetting');

exports.getSetting = async (req, res) => {
  try {
    const dealerId = req.user.dealer_id;
    const setting = await getSettingByDealerId(dealerId);

    if (!setting) {
      return res.status(200).json({ message: 'هیچ اطلاعاتی یافت نشد.' });
    }

    const { dealer_id, ...settingWithoutDealerId } = setting;
    return res.status(200).json(settingWithoutDealerId);

  } catch (error) {
    console.error('خطا در دریافت اطلاعات تنظیمات:', error);
    return res.status(500).json({ message: 'خطای سرور هنگام دریافت تنظیمات.' });
  }
};
