const { exportLogsToExcel } = require('../../services/report/logsreport');

exports.exportLogsExcel = async (req, res) => {
  try {
    const { workbook, fileName } = await exportLogsToExcel({ user: req.user, query: req.query });

    const encodedFileName = encodeURIComponent(fileName);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('exportLogsExcelController error:', err);
    res.status(err.status || 500).json({ error: err.message || 'خطای سرور در خروجی اکسل لاگ‌ها' });
  }
};
