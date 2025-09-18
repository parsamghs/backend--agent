const moment = require('moment-jalaali');
require('moment-timezone');
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

function getTimesService() {
  const tehrandate = moment().tz('Asia/Tehran').format('jYYYY/jMM/jDD');
  const tehranTime = moment().tz('Asia/Tehran').format('HH:mm');
  const tehranDay = moment().tz('Asia/Tehran').format('dddd');
  const tehranMonth = moment().tz('Asia/Tehran').format('jMMMM');

  return {
    tehran_Time: tehranTime,
    tehran_date: tehrandate,
    tehran_day: tehranDay,
    tehran_month: tehranMonth,
  };
}

module.exports = { getTimesService };
