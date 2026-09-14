const fs = require('fs');
const path = require('path');

/**
 * Collects and returns all cron job classes across modules.
 * Automatically loads jobs from modules if AUTO_LOAD_JOBS env is true.
 * Manually registered jobs can also be added.
 */
const getCronJobs = () => {
    const jobs = [];

    // Automatically load jobs from the modules folder
    if (process.env.AUTO_LOAD_JOBS === 'true') {
        const modulesDir = path.join(__dirname, '../modules');

        /**
         * Recursively traverses directories to find job files
         * @param {string} dir - The current directory path
         */
        const traverseDirectories = (dir) => {
            if (!fs.existsSync(dir)) return

            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    traverseDirectories(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.job.js')) {
                    try {
                        const JobModule = require(fullPath);

                        // Ensure the export is a class with a 'startSchedule' method
                        if (
                            typeof JobModule === 'function' &&
                            typeof JobModule.prototype.startSchedule === 'function'
                        ) {
                            jobs.push({ JobClass: JobModule });
                        }
                    } catch (error) {
                        console.error(`Failed to load job from ${fullPath}:`, error);
                    }
                }
            }
        };

        traverseDirectories(modulesDir);
    }

    // -------------------------------
    // Manually register specific jobs
    // -------------------------------
    // Example:
    // const UpdateStatusUserJob = require('../modules/user/jobs/update.status.user.job.js');
    // jobs.push({ JobClass: UpdateStatusUserJob, schedule: '0 2 * * *' });

    return jobs;
};

module.exports = {
    getCronJobs,
};