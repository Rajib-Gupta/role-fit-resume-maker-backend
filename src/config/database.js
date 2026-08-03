const mongoose = require("mongoose");

async function connectToDB() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in the environment variables");
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully");
    return mongoose.connection;
}

module.exports = connectToDB;