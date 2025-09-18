async function findUserByCodeMeli(pool, code_meli) {
  const result = await pool.query('SELECT * FROM login WHERE code_meli = $1', [code_meli]);
  return result.rows;
}

async function insertUser(pool, { name, last_name, code_meli, hashedPassword, role, dealer_id }) {
  await pool.query(
    `INSERT INTO login (name, last_name, code_meli, password, role, dealer_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [name, last_name, code_meli, hashedPassword, role, dealer_id]
  );
}

module.exports = {
  findUserByCodeMeli,
  insertUser,
};
