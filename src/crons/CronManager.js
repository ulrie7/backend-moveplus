const cron = require('node-cron');
const { getCronJobs } = require('./CronRegistry');
const CoreServices = require("../shared/services/core.services")

class CronManager extends CoreServices {
    constructor() {
        super()
        this.activeJobs = []
    }

    initialize() {
        const cronJobs = getCronJobs();
        cronJobs.forEach(({ JobClass }) => {
            const jobInstance = new JobClass();
            const job = jobInstance.startSchedule(cron, JobClass.schedule);

            if (job) {
                this.activeJobs.push(job); // Track active jobs
                this.Logger.info(`Scheduled job: ${JobClass.name} with schedule ${JobClass.schedule}`);
            }

        });
    }

    async shutdown() {
        this.Logger.info('Shutting down all cron jobs...');
        await Promise.all(this.activeJobs.map((job) => job.stop && job.stop())); // Stop all jobs
        this.Logger.info('All cron jobs have been stopped.');
    }
}

module.exports = CronManager;