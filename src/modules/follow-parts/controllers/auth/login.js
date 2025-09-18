const { loginService } = require('../../services/auth/login');

async function login(req, res) {
  const { code_meli, password } = req.body;

  const result = await loginService(code_meli, password);

  if (result.status === 200) {
    return res.status(200).json(result.data);
  } else {
    return res.status(result.status).json({ message: result.message });
  }
}

module.exports = { login };
