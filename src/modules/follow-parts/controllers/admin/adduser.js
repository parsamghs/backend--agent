const { addUserService } = require('../../services/admin/adduser');

async function addUser(req, res) {
  const { name, last_name, code_meli, password, role } = req.body;
  const dealer_id = req.user?.dealer_id;

  const result = await addUserService({
    name,
    last_name,
    code_meli,
    password,
    role,
    dealer_id,
  });

  return res.status(result.status).json({ message: result.message });
}

module.exports = { addUser };
