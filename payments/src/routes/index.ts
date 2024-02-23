import express, { Router, Request, Response } from "express";
import { body } from "express-validator";
import { authenticate, currentUser, validateRequest } from "@devorium/common";
import { charge } from "../handlers";

const router = express.Router();

router.post(
  "/",
  authenticate,
  [
    body("token").not().isEmpty().withMessage("Token is required"),
    body("orderId").not().isEmpty().withMessage("OrderId is required"),
  ],
  validateRequest,
  charge,
);

export default router;
