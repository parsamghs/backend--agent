const { generateLostOrdersReport } = require('../../services/report/lostordersreport');
const ExcelJS = require('exceljs');

exports.downloadLostOrdersReport = async (req, res) => {
  try {
    const result = await generateLostOrdersReport({ user: req.user, query: req.query });

    if (result.type === 'csv') {
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.attachment(result.fileName);
      return res.send(result.content);
    }

    if (result.type === 'excel') {
      const encodedFileName = encodeURIComponent(result.fileName);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}.xlsx`);
      await result.workbook.xlsx.write(res);
      res.end();
      return;
    }

  } catch (err) {
    console.error('downloadLostOrdersReportController error:', err);
    res.status(err.status || 500).json({ message: err.message || 'خطا در دریافت گزارش.' });
  }
};
