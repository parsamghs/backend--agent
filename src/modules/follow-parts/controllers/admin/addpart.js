const { addPartService } = require('../../services/admin/addpart');

async function addPart(req, res) {
  const { technical_code, part_name } = req.body;
  const category = req.user?.category;

  if (!category) {
    return res.status(400).json({ message: 'دسته‌بندی کاربر نامعتبر است.' });
  }

  const result = await addPartService(category, technical_code, part_name);
  return res.status(result.status).json({ message: result.message });
}

module.exports = { addPart };
