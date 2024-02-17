import express, { Router, Request, Response } from "express";
import { createOrders, cancelOrder, getOrder, getOrders } from "../handlers";
import { authenticate, validateRequest } from "@devorium/common";
import { body } from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

router.post(
  "/",
  authenticate,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  createOrders,
);
router.get("/", authenticate, getOrders);
router.get("/:id", authenticate, getOrder);
router.patch("/:id", authenticate, cancelOrder);

export default router;
