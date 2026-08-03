const mongoose = require("mongoose");


async function connectToDB(){
    try {
        if(!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in the environment variables");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.log('error', error)
        
    }
}

module.exports = connectToDB;