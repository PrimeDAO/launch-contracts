const { time } = require("@openzeppelin/test-helpers");

const SEVEN_DAYS = time.duration.days(7);
const TEN_DAYS = time.duration.days(10);
const HUNDRED_DAYS = time.duration.days(100);
const TWENTY_SEC = time.duration.seconds(20);

module.exports = {
  SEVEN_DAYS,
  TEN_DAYS,
  HUNDRED_DAYS,
  TWENTY_SEC,
};
