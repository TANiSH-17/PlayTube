// require('dotenv').config({path : './.env'});  commonJS
import dotenv from "dotenv";
import connectToDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: "./.env" 
}); // Load environment variables from .env file

connectToDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port : ${process.env.PORT}`);
    })
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})


// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// Ye code MongoDB ke saath connection establish karne ke liye hai
// Mongoose ka use karke MongoDB se connect karne ke liye
// iffi function ka istemal kiya gaya hai taaki async/await ka use kar sakein aur connection ka status dekh sakein
// Mongoose ko import kiya gaya hai aur DB_NAME ko import kiya gaya hai, Mongoose ko connect karne ke liye process.env.MONGO_URL se MongoDB URL liya gaya hai aur DB_NAME ke saath connect kiya gaya hai
// Agar connection mein koi error aata hai to "MongoDB connection failed" message console par print hoga aur error throw kiya jayega
/*
;(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}/ ${DB_NAME}`);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
})()
*/