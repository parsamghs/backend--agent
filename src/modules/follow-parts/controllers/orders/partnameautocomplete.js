const { suggestPartsByNameService } = require('../../services/orders/partnameautocomplete');

exports.suggestPartsByName = async (req, res) => {
    const q = req.params.partname_id;
    const dealerId = req.user.dealer_id;

    try {
        const result = await suggestPartsByNameService(dealerId, q);
        res.json(result);
    } catch (error) {
        console.error('Autocomplete by name error:', error.message || error);
        res.status(400).json({ message: error.message || 'خطای سرور در جستجوی نام قطعه' });
    }
};
