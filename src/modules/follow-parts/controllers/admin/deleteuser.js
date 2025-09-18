const { deleteUserService } = require('../../services/admin/deleteuser');

async function deleteUser(req, res) {
  const { id } = req.params;
  const dealer_id = req.user?.dealer_id;

  const result = await deleteUserService(id, dealer_id);
  return res.status(result.status).json({ message: result.message });
}

module.exports = { deleteUser };
