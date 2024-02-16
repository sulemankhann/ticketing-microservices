import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import Ticket from "../src/models/ticket";
import Order, { OrderStatus } from "../src/models/order";

it("has a route handler listning to /api/orders for post request", async () => {
  const response = await request(app).post("/api/orders").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/orders").send({}).expect(401);
});

it("returns a status other than 401 if the user is singed in", async () => {
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.createCookie())
    .send({});

  expect(response.statusCode).not.toEqual(401);
});

it("returns and error if an invalid ticketId is provided", async () => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.createCookie())
    .send({
      ticketId: "",
    })
    .expect(400);

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.createCookie())
    .send({})
    .expect(400);
});

it("returns and error if the ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.createCookie())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "lsdadfad",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.createCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserve a ticket", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.createCookie())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it.todo("emits an order created event");
