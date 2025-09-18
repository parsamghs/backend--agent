async function findUserByIdAndDealer(pool, id, dealer_id) {
  const result = await pool.query(
    'SELECT * FROM login WHERE id = $1 AND dealer_id = $2',
    [id, dealer_id]
  );
  return result.rows;
}

async function deleteUserByIdAndDealer(pool, id, dealer_id) {
  await pool.query('DELETE FROM login WHERE id = $1 AND dealer_id = $2', [id, dealer_id]);
}

module.exports = {
  findUserByIdAndDealer,
  deleteUserByIdAndDealer,
};
