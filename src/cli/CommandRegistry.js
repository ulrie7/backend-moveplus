const path = require('path');
const fs = require('fs');

class CommandRegistry {
    static getHandler(command, subCommand) {
        const commandDir = path.join(__dirname, 'commands', command || '');
        const commandFile = path.join(commandDir, `${subCommand || 'index'}.js`);

        if (fs.existsSync(commandFile)) {
            return require(commandFile);
        }

        return null; // Command not found
    }
}

module.exports = CommandRegistry;