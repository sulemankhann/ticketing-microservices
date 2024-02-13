import { Router, Request, Response } from "express";
import Ticket from "../models/ticket";
import { NotFoundError } from "@devorium/common";

export const createTicket = async (req: Request, res: Response) => {
  const { title, price } = req.body;

  const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });

  await ticket.save();

  res.status(201).send(ticket);
};

export const getTicket = async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.status(200).send(ticket);
};
