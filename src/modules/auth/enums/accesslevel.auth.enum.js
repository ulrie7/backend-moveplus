/**
 * @AccessLevel
 */

const actorTypes = require("./auth.enum")
module.exports = Object.freeze({
    LV_0: {
        ACTOR_TYPES: [actorTypes.ACTOR_TYPES.ADMINS.NAME],
        level: 0
    }
})