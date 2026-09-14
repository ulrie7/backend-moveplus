/**
 * @IdentityAuditAuthEnum
 */

module.exports = Object.freeze({
    ACTIONS: {
        CREATE: {
            KEY: "create"
        },
        UPDATE: {
            KEY: "update"
        },
        DELETE: {
            KEY: "delete"
        },
        RESTORE_DELETED: {
            KEY: "restore-delete"
        },
        ACTIVATE: {
            KEY: "activate"
        },
        DEACTIVATE: {
            KEY: "deactivate"
        },
        BLOCK: {
            KEY: "block"
        },
        UNBLOCK: {
            KEY: "unblock"
        },
    }
})