const mongoose = require('mongoose');
const db = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(db, {dbName:'QLDAPM'})
        console.log("Connected to MongoDB");
    }catch(err) {
        console.error(err)
        process.exit(1);
    }
}
module.exports = connectDB;