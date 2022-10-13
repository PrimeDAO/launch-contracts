const { time } = require("@openzeppelin/test-helpers");

const ONE_MINUTE = time.duration.seconds(60);
const ONE_DAY = time.duration.days(1);
const SEVEN_DAYS = time.duration.days(7);
const TEN_DAYS = time.duration.days(10);
const TWENTY_DAYS = time.duration.days(20);
const FOURTY_DAYS = time.duration.days(40);
const EIGHTY_DAYS = time.duration.days(80);
const HUNDRED_DAYS = time.duration.days(100);

const increaseTime = async (duration) => await time.increase(duration);

const getCurrentTime = async () => await time.latest();

module.exports = {
  SEVEN_DAYS,
  ONE_DAY,
  TEN_DAYS,
  TWENTY_DAYS,
  FOURTY_DAYS,
  EIGHTY_DAYS,
  HUNDRED_DAYS,
  ONE_MINUTE,
  increaseTime,
  getCurrentTime,
};
