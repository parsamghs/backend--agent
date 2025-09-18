const { getUsersWithStatsModel } = require("../../models/admin/getuserswithstats");
const moment = require("moment-jalaali");
const momentTZ = require("moment-timezone");

moment.loadPersian({ dialect: "persian-modern", usePersianDigits: false });

async function getUsersWithStatusService(dealer_id) {
  const result = await getUsersWithStatsModel(dealer_id);

  const now = momentTZ.tz("Asia/Tehran");

  return result.rows.map((user) => {
    let isOnline = false;
    let lastActiveDate = null;
    let lastActiveTime = null;

    if (user.last_active) {
      const localMoment = moment(user.last_active).tz("Asia/Tehran");

      const diffMinutes = now.diff(localMoment, "minutes");
      isOnline = diffMinutes <= 5;

      lastActiveDate = localMoment.format("jYYYY/jMM/jDD");
      lastActiveTime = localMoment.format("HH:mm");
    }

    return {
      user_id: user.id,
      name: user.name,
      last_name: user.last_name,
      code_meli: user.code_meli.toString().padStart(10, "0"),
      role: user.role,
      last_active_date: lastActiveDate,
      last_active_time: lastActiveTime,
      online: isOnline,
    };
  });
}

module.exports = { getUsersWithStatusService };
