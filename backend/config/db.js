const mongoose = require('mongoose');
const config = require('config');
const db = config.get("mongodb_URI");

const connectDB = async () => {
    try {
        await mongoose.connect(db)
        console.log("Connected to MongoDB");
    }catch(err) {
        console.error(err)
        process.exit(1);
    }
}
module.exports = connectDB;