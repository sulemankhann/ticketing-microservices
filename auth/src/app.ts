import express from "express";
import "express-async-errors";
import { json } from "body-parser";
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

export default app;
