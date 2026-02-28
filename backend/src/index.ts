import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import postsRoute from "./routes/posts_route";
import userRoute from "./routes/user_route";
import commentRoute from "./routes/comments_route";

dotenv.config({ path: ".env.dev" });

const app = express();
app.use(cors()); 
app.use(express.json());

app.use("/posts", postsRoute);
app.use("/users", userRoute);
app.use("/comments", commentRoute);

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