import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectToDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);  
        console.log(`MongoDB connected successfully to database, hosted at: ${connectionInstance.connection.host}`);
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); // Exit the process with failure
        throw error;
    }

}
export default connectToDB;