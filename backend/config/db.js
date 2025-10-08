// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "QLDAPM",
        });
        console.log("[DB] Connected to MongoDB");
        console.log("[DB] Database name =", mongoose.connection.name);
    } catch (err) {
        console.error("[DB] Connection error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
