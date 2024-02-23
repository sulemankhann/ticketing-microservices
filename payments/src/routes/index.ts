import express, { Router, Request, Response } from "express";
import { body } from "express-validator";
import { authenticate, currentUser, validateRequest } from "@devorium/common";
import { createPaymentIntent, handlePaymentIntentStatus } from "../handlers";

const router = express.Router();

router.post(
  "/create-payment-intent",
  authenticate,
  [body("orderId").not().isEmpty().withMessage("OrderId is required")],
  validateRequest,
  createPaymentIntent,
);

router.post(
  "/handle-payment-intent-status",
  authenticate,
  [
    body("paymentIntentId")
      .not()
      .isEmpty()
      .withMessage("paymentIntentId is required"),
  ],
  validateRequest,
  handlePaymentIntentStatus,
);

export default router;
