import mongoose, { set } from "mongoose";
import { Message } from "node-nats-streaming";
import TicketUpdatedListener from "../src/events/listeners/ticket-updated-listener";
import Ticket from "../src/models/ticket";
import { natsWrapper } from "../src/nats-wrapper";
import { TicketUpdatedEvent } from "@devorium/common";

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save  a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "music concert",
    price: 999,
    userId: "adfasd",
  };
  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  // return all of this stuff
  return { listener, data, msg };
};

it("finds, updates and saves a ticket", async () => {
  const { msg, data, listener } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { msg, data, listener } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { msg, data, listener } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
