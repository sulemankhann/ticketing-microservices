import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import mongoose from "mongoose";
import cookieSession from "cookie-session";

import routes from "./routes";
import errorHandler from "./middleware/error-handler";
import NotFoundError from "./errors/not-found-error";

const app = express();
app.set("trust proxy", true);

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: true,
  }),
);

app.use("/api/users", routes);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");
    console.log("Connecting to mongodb");
  } catch (err) {
    console.error("Unable to connect to db", err);
  }
  app.listen(3000, () => {
    console.log("Listening on port 3000!");
  });
};

start();
