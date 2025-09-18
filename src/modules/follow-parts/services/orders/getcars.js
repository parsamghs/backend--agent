const { getCarsByTable } = require('../../models/orders/getcars');

const categoryTableMap = {
    'ایران خودرو': 'irankhodro_cars',
    'مدیران خودرو': 'mvm_cars',
    'تویوتا': 'toyota_cars',
    'ماموت': 'mammut_cars',
    'تست': 'test_cars'
};

const getAllCarsService = async (category) => {
    const tableName = categoryTableMap[category];
    if (!tableName) {
        throw new Error('دسته‌بندی نمایندگی معتبر نیست.');
    }

    const cars = await getCarsByTable(tableName);
    return cars.map(car => ({ value: car.car_name, label: car.car_name }));
};

module.exports = { getAllCarsService };
