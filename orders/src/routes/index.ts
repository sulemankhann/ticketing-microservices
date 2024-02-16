import express, { Router, Request, Response } from "express";
import { createOrders, deleteOrder, getOrder, getOrders } from "../handlers";

const router = express.Router();

router.post("/", createOrders);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.delete("/:id", deleteOrder);

export default router;
