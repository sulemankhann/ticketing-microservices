import { Request, Response } from "express";
import Ticket from "../models/ticket";
import { BadRequestError, NotFoundError, OrderStatus } from "@devorium/common";
import Order from "../models/order";

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

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

  //TODO: publish an event, the order is created

  res.status(201).send(order);
};

export const getOrders = async (req: Request, res: Response) => {
  res.send({});
};

export const getOrder = async (req: Request, res: Response) => {
  res.send({});
};

export const deleteOrder = async (req: Request, res: Response) => {
  res.send({});
};
