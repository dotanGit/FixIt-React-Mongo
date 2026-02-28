import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ path: ".env.dev" });

const app = express();
app.use(cors()); 
app.use(express.json());


const initApp = () => {
  const pr = new Promise<Express>((resolve, reject) => {
    const dbUrl = process.env.DB_CONNECT;
    if (!dbUrl) {
      reject("DATABASE_URL is not defined");
      return;
    }
    mongoose
      .connect(dbUrl, {})
      .then(() => {
        resolve(app);
      });
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    db.once("open", () => console.log("Connected to Database"));
  });
  return pr;
};

export default initApp;