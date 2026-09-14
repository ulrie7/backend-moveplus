class Seeder {
    async run() {
        throw new Error("Seeder 'run()' method must be implemented in child class.");
    }

    async log(message) {
        console.log(`[Seeder] ${message}`);
    }
}

module.exports = Seeder;