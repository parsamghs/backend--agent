async function addPartModel(client, category, technical_code, part_name) {
  const query = `
    INSERT INTO parts (category, technical_code, part_name)
    VALUES ($1, $2, $3)
    ON CONFLICT (technical_code) DO NOTHING
  `;
  await client.query(query, [category, technical_code, part_name]);
}

module.exports = { addPartModel };
