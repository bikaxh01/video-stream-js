import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

// DB CONNECTION
const DB_Connection= async ()=> {
  try {
   await mongoose.connect(`${process.env.DATABASE_URL}/${DB_Name}`);
    console.log("DB connected !!");
  } catch (error) {
    console.log("ERROR WHILE CONNECTION TO DG: ", error);
    process.exit(1);
  }
};


export default DB_Connection;
