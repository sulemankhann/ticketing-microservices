import { Router, Request, Response } from "express";
import Ticket from "../models/ticket";
import { NotAuthorizedError, NotFoundError } from "@devorium/common";

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

export const getTickets = async (req: Request, res: Response) => {
  const tickets = await Ticket.find({});

  res.status(200).send(tickets);
};

export const upateTickets = async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  const { title, price } = req.body;

  if (!ticket) {
    throw new NotFoundError();
  }

  if (ticket.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  ticket.set({
    title,
    price,
  });

  await ticket.save();

  res.send(ticket);
};