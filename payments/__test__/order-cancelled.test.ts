import mongoose from "mongoose";
import { OrderCancelledEvent, OrderStatus } from "@devorium/common";
import OrderCancelledListener from "../src/events/listener/order-cancelled-listener";
import Order from "../src/models/order";
import { natsWrapper } from "../src/nats-wrapper";

const setup = async () => {
  // create an instance of listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: "adfasdf",
    status: OrderStatus.Created,
    price: 20,
  });
  await order.save();
  // create the fake data event
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("updates the status of the order", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(data.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
