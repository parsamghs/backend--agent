const { suggestPartsService } = require('../../services/orders/partsautocomplete');

exports.suggestParts = async (req, res) => {
  const { q } = req.query;
  const category = req.user.category;

  if (!q || q.trim().length < 5) {
    return res.status(400).json({ message: 'حداقل 5 کاراکتر برای جستجو لازم است.' });
  }

  try {
    const parts = await suggestPartsService(category, q);
    res.json(parts);
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ message: 'خطای سرور در جستجوی قطعه' });
  }
};
