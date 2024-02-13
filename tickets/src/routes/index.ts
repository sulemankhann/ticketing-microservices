import express, { Router, Request, Response } from "express";
import { body } from "express-validator";
import { authenticate, currentUser, validateRequest } from "@devorium/common";

import { createTicket, getTicket, getTickets, upateTickets } from "../handlers";

const router = express.Router();

router.post(
  "/",
  authenticate,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be provided and must be greater than 0"),
  ],
  validateRequest,
  createTicket,
);

router.get("/", getTickets);
router.get("/:id", getTicket);
router.put(
  "/:id",
  authenticate,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be provided and must be greater than 0"),
  ],
  validateRequest,
  upateTickets,
);

export default router;
