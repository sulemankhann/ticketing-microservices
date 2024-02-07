import express, { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import RequestValidationError from "../errors/request-validation-error";
import DatabaseConnectionError from "../errors/database-connection-error";
import { currentuser, signin, signup } from "../handlers";
import validateRequest from "../middleware/validate-request";

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
  validateRequest,
  signup,
);

router.post(
  "/sigin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  signin,
);

router.post("/signout", (req, res) => {
  res.send("Hi there!");
});

router.get("/currentuser", currentuser);

export default router;
