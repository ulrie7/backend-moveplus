const SeedRunner = require('../../../database/seeders/SeedRunner');

module.exports = async(options) => {
    const [moduleName] = options;
    if (!moduleName) {
        throw new Error('Usage: orangcode db:seed <module>');
    }

    console.log(`Starting seeding for module: ${moduleName}`);
    const seedRunner = new SeedRunner(moduleName);
    await seedRunner.run();
    console.log('Seeding completed successfully.');
};