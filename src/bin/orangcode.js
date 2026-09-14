#!/usr/bin/env node

const CommandRegistry = require('../cli/CommandRegistry');

const bootstrap = require('../config/bootstrap'); // Load app config


(async() => {

    await bootstrap()

    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Error: No command provided. Use `--help` for usage.');
        process.exit(1);
    }

    const [command, subCommand] = args[0].split(':');
    const options = args.slice(1);

    try {
        const handler = CommandRegistry.getHandler(command, subCommand);
        if (!handler) {
            throw new Error(`Unknown command: ${args[0]}`);
        }
        await handler(options);

        process.exit(1);

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
})();