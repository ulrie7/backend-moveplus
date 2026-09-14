const ONE_DAY_IN_MS = 86400000; // 1 day in milliseconds

module.exports = {
    EXPIRED_TIME: ONE_DAY_IN_MS, // 1 day in milliseconds
    ACCESS_TOKEN_EXPIRED_TIME: ONE_DAY_IN_MS, // 1 day in milliseconds
    REFRESH_TOKEN_EXPIRED_TIME: ONE_DAY_IN_MS * 15, // 15 days in milliseconds
    DEFAULT_DATE: 946767600000, // Sunday, Jan 02 2000 in milliseconds
};