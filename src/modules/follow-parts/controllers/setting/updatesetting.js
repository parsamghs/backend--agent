const { updateSettingService } = require('../../services/setting/updatesetting');

exports.updateSetting = async (req, res) => {
  try {
    if (!req.user.dealer_id) {
      return res.status(400).json({ message: 'شناسه نمایندگی نامعتبر است.' });
    }

    const result = await updateSettingService(req.user.dealer_id, req.body);
    res.status(200).json(result);

  } catch (error) {
    console.error('خطا در ویرایش تنظیمات:', error.message);
    res.status(500).json({ message: error.message || 'خطای سرور هنگام ویرایش تنظیمات.' });
  }
};
