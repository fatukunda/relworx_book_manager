import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to Relworx Books Manager!" });
});

export default app;
