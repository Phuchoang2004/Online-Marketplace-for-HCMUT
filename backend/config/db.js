const mongoose = require('mongoose');
const db = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(db, {dbName:'MERN-Auth'})
        console.log("Connected to MongoDB");
    }catch(err) {
        console.error(err)
        process.exit(1);
    }
}
module.exports = connectDB;