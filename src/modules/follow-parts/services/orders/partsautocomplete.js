const redisClient = require('../../../../config/redisClient');
const { getPartsByQuery } = require('../../models/orders/partsautocomplete');

/**
 * 
 * @param {string} category 
 * @param {string} query 
 * @returns {Promise<Array>}
 */
const suggestPartsService = async (category, query) => {
  const cacheKey = `suggest:${category}:${query.trim()}`;

  const cachedResult = await redisClient.get(cacheKey);
  if (cachedResult) {
    return JSON.parse(cachedResult);
  }

  console.log('🔸 پاسخ از دیتابیس گرفته شد و کش خواهد شد');

  const parts = await getPartsByQuery(category, query);

  await redisClient.setEx(cacheKey, 300, JSON.stringify(parts));

  return parts;
};

module.exports = { suggestPartsService };
