const { getUsersWithStatusService } = require("../../services/admin/getuserswithstats");

async function getUsersWithStatus(req, res) {
  try {
    const dealer_id = req.user?.dealer_id;
    if (!dealer_id) {
      return res.status(403).json({ message: "دسترسی غیرمجاز: شناسه نمایندگی یافت نشد." });
    }

    const users = await getUsersWithStatusService(dealer_id);
    res.status(200).json(users);
  } catch (err) {
    console.error("🔴 خطا در getUsersWithStatus:", err);
    res.status(500).json({ message: "خطا در دریافت وضعیت کاربران" });
  }
}

module.exports = { getUsersWithStatus };
