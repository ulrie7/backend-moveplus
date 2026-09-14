/**************************************************
 * @bootstrap
 */
const dotenv = require('dotenv');
dotenv.config();

require('colors');
const DBConnection = require('../db/connection'); // Your existing DB connection function
const loadIndexes = require("../db/indexManager"); // Load index manager

async function bootstrap() {
    console.log('Initializing application...'.cyan);

    // Connect to MongoDB
    await DBConnection();

    // Load indexes dynamically
    await loadIndexes();

    console.log('Application initialized.'.green);
}

module.exports = bootstrap;