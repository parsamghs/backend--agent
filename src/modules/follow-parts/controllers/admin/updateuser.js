const { updateUserService } = require('../../services/admin/updateuser');

async function updateUser(req, res) {
  const userRole = req.user?.role;
  const dealer_id = req.user?.dealer_id;
  const userId = parseInt(req.params.id, 10);

  const { name, last_name, code_meli, password, role } = req.body;

  const result = await updateUserService(userRole, dealer_id, userId, {
    name,
    last_name,
    code_meli,
    password,
    role,
  });

  return res.status(result.status).json({ message: result.message });
}

module.exports = { updateUser };
