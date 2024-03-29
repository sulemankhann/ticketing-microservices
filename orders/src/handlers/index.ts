import { Request, Response } from "express";
import Ticket from "../models/ticket";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
} from "@devorium/common";
import Order from "../models/order";
import { natsWrapper } from "../nats-wrapper";
import OrderCreatedPublisher from "../events/publisher/order-created-publisher";
import OrderCancelledPublisher from "../events/publisher/order-cancelled-publisher";

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

export const createOrders = async (req: Request, res: Response) => {
  const { ticketId } = req.body;

  // Find the ticket user is trying to order in the database
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new NotFoundError();
  }

  // Make sure that this ticket is not already reserved
  const isReserved = await ticket.isReserved();
  if (isReserved) {
    throw new BadRequestError("Ticket is already reserved");
  }

  // Calculate an expirtion date for this order
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  // Build the order and save it in the order
  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket,
  });
  await order.save();

  new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    status: order.status,
    userId: order.userId,
    expiresAt: order.expiresAt.toISOString(),
    ticket: {
      id: order.ticket.id,
      price: order.ticket.price,
    },
  });

  res.status(201).send(order);
};

export const getOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.currentUser!.id }).populate(
    "ticket",
  );

  res.send(orders);
};

export const getOrder = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate("ticket");

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  res.send(order);
};

export const cancelOrder = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate("ticket");

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;

  await order.save();

  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
    },
  });

  res.send(order);
};
