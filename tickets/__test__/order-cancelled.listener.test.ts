import mongoose from "mongoose";
import { OrderCancelledEvent } from "@devorium/common";
import { Message } from "node-nats-streaming";
import OrderCancelledListener from "../src/events/listener/order-cancelled-listener";
import Ticket from "../src/models/ticket";
import { natsWrapper } from "../src/nats-wrapper";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "asdf",
  });

  ticket.orderId = orderId;
  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

it("updates the ticket", async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toBeUndefined();
});

it("publishes a ticket updated event", async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );

  expect(ticketUpdatedData?.orderId).toBeUndefined();
});

it("acks the message", async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
