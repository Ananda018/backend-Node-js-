//require("dotenv").config({path: "./.env"});

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({ path: "./.env" });
connectDB();























/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express();

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("Error:", error);
      throw error;
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });

  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
})();
*/
