const { getAllCarsService } = require('../../services/orders/getcars');

exports.getAllCars = async (req, res) => {
    try {
        const cars = await getAllCarsService(req.user.category);
        res.json(cars);
    } catch (error) {
        console.error('Get all cars error:', error);
        res.status(500).json({ message: error.message || 'خطای سرور در دریافت نام خودروها' });
    }
};
