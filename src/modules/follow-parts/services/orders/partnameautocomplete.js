const redisClient = require('../../../../config/redisClient');
const { findPartsByName } = require('../../models/orders/partnameautocomplete');

const suggestPartsByNameService = async (dealerId, q) => {
    const plainQuery = q?.trim().replace(/\*/g, '');
    if (!plainQuery || plainQuery.length < 1) {
        throw new Error('حداقل 1 کاراکتر معتبر برای جستجو لازم است.');
    }

    const cacheKey = `suggest_lost_name:${dealerId}:${plainQuery}`;
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
        return JSON.parse(cachedResult);
    }

    const rawWords = plainQuery.split(/\s+/);
    const rows = await findPartsByName(dealerId, rawWords);

    await redisClient.setEx(cacheKey, 300, JSON.stringify(rows));

    return rows;
};

module.exports = { suggestPartsByNameService };
