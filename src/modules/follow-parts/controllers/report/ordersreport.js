const { exportOrdersExcelService } = require('../../services/report/ordersreport');

exports.exportOrdersExcel = async (req, res) => {
  try {
    const { workbook, dealerName, dealerId, startDate, endDate, canceledStatuses } = await exportOrdersExcelService({ user: req.user, query: req.query });

    // فایل نهایی و ارسال
    let fileName = `لیست سفارشات-نمایندگی-${dealerName || 'NA'}-کد-${dealerId || 'NA'}`;
    if (startDate && endDate) fileName += `-از-${startDate}-تا-${endDate}`;
    const encodedFileName = encodeURIComponent(fileName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('exportOrdersExcelController error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
