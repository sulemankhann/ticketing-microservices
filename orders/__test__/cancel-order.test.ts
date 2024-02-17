import request from "supertest";
import app from "../src/app";
import Ticket from "../src/models/ticket";
import mongoose from "mongoose";
import { OrderStatus } from "@devorium/common";
import Order from "../src/models/order";
import { natsWrapper } from "../src/nats-wrapper";

it("returns 404 if order does not exist", async () => {
  const user = global.createCookie();

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const { body: fetchOrder } = await request(app)
    .patch(`/api/orders/${orderId}`)
    .set("Cookie", user)
    .send({})
    .expect(404);
});

it("returns 401 if order does not belong to current user", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  const userOne = global.createCookie();
  const userTwo = global.createCookie();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set("Cookie", userTwo)
    .send({})
    .expect(401);
});

it("cancel the order", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  const user = global.createCookie();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: cancelOrder } = await request(app)
    .patch(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send({})
    .expect(200);

  const updatedOrder = await Order.findById(cancelOrder.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
  expect(updatedOrder?.id).toEqual(order.id);
});

it("emits a order cancelled event", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  const user = global.createCookie();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: cancelOrder } = await request(app)
    .patch(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send({})
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
