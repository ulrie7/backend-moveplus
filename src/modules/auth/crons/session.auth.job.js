/**
 * @AuthSessionCleanupJob 
 */

const CoreServices = require("../../../shared/services/core.services")
const AuthServices = require('../services/auth.services')
module.exports = class AuthSessionCleanupJob extends CoreServices {

    constructor() {
        super()
        this.AuthServices = new AuthServices()

    }

    static schedule = '0 * * * *'

    startSchedule(cron, shedule = AuthSessionCleanupJob.schedule) {
        const job = cron.schedule(shedule, async() => {
            console.log('AuthSessionCleanupJob running every 1 hour');
            try {

                await this.AuthServices._startSessionCleanupJob()
            } catch (error) {
                console.error("error", error)
            }
        });

        return {
            stop: () => job.stop(), // Expose stop method
        };

    }
}