import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@devorium/common";
import OrderCreatedListener from "../src/events/listener/order-created-listener";
import Ticket from "../src/models/ticket";
import { natsWrapper } from "../src/nats-wrapper";
import mongoose from "mongoose";

const setup = async () => {
  // create an instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    userId: "adfad",
  });

  await ticket.save();

  // create the fake data event
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "adfasdf",
    expiresAt: "dsfasd",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("sets the orderId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
