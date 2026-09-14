const mongoose = require("mongoose");

const connectDB = async() => {
    try {
        // Set strictQuery to false (or true depending on your choice)
        mongoose.set('strictQuery', true); // Use false to allow queries with fields not in schema

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`Mongo connected : ${conn.connection.host}`.cyan.underline.bold);
    } catch (err) {
        console.log(`Mongo connection error : ${err}`.red);
        process.exit(1);
    }
};

module.exports = connectDB;