import express, { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import {
  RequestValidationError,
  DatabaseConnectionError,
  validateRequest,
  currentUser as currentUserMiddleware,
  authenticate,
} from "@devorium/common";
import { currentUser, signin, signout, signup } from "../handlers";

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
  "/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  signin,
);

router.post("/signout", signout);

router.get("/currentuser", currentUserMiddleware, authenticate, currentUser);

export default router;
