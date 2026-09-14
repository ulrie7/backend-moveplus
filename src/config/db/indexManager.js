const fs = require("fs");
const path = require("path");

// Load all index definitions dynamically
const loadIndexes = async() => {
    console.log("🔍 Loading MongoDB indexes...".cyan);

    // Base path for all index definitions
    const basePath = path.join(path.dirname(__dirname), "../modules");

    // Scan all module directories
    fs.readdirSync(basePath).forEach((moduleName) => {
        const indexPath = path.join(basePath, moduleName, "db_indexes");

        // Check if index definition folder exists
        if (fs.existsSync(indexPath)) {
            // Load all index files
            fs.readdirSync(indexPath).forEach(async(file) => {
                if (file.endsWith(".indexes.js")) {
                    console.log(`📂 Loading index: ${moduleName}/${file}`.yellow);
                    const indexSetup = require(path.join(indexPath, file));
                    await indexSetup(); // Execute the index setup
                }
            });
        }
    });

    console.log("✅ All MongoDB indexes loaded.".green);
};

module.exports = loadIndexes;