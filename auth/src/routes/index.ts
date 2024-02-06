import express, { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import RequestValidationError from "../errors/request-validation-error";
import DatabaseConnectionError from "../errors/database-connection-error";

const router: Router = express.Router();

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const { email, passwod } = req.body;

    console.log("Creating a user....");
    throw new DatabaseConnectionError();

    res.send("Hi there!");
  },
);

router.post("/sigin", (req, res) => {
  res.send("Hi there!");
});

router.post("/signout", (req, res) => {
  res.send("Hi there!");
});

router.get("/currentuser", (req, res) => {
  res.send("Hi there!");
});

export default router;
