import express from "express";
import config from "dotenv";
import userRouter from "./routes/userRouter";
import bookRouter from "./routes/bookRouter";

config.config();
import("./config/database");
const app = express();

app.use(express.json());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to Relworx Books Manager!" });
});

export default app;
