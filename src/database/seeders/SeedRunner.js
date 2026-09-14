const path = require('path');
const fs = require('fs');

class SeedRunner {
    constructor(moduleName) {
        this.moduleName = moduleName;
    }

    async run() {
        try {
            const seederPath = path.join(__dirname, '../../modules', this.moduleName, 'seeds');
            const files = fs.readdirSync(seederPath);

            for (const file of files) {
                if (file.endsWith('.seeder.js')) {
                    const SeederClass = require(path.join(seederPath, file));
                    const seeder = new SeederClass();
                    console.log(`Running seeder: ${file}`);
                    await seeder.run();
                }
            }

            console.log('All seeders executed successfully.');
        } catch (error) {
            console.error(`Error running seeders: ${error.message}`);
        }
    }
}

module.exports = SeedRunner;