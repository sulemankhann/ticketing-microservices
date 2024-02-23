import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import Order from "../src/models/order";
import { OrderStatus } from "@devorium/common";
import { stripe } from "../src/stripe";

it("returns a 404 when purchasing an order that does not exit", async () => {
  await request(app)
    .post("/api/payments/create-payment-intent")
    .set("Cookie", global.createCookie())
    .send({
      token: "asdfasd",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns a 401 when purchasing an order that does not belong to user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 20,
  });

  await order.save();

  await request(app)
    .post("/api/payments/create-payment-intent")
    .set("Cookie", global.createCookie())
    .send({
      token: "asdfasd",
      orderId: order.id,
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Cancelled,
    price: 20,
  });

  await order.save();

  await request(app)
    .post("/api/payments/create-payment-intent")
    .set("Cookie", global.createCookie(order.userId))
    .send({
      token: "asdfasd",
      orderId: order.id,
    })
    .expect(400);
});

it("returns stripe payment intent obj with valid inputs", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 20,
  });

  await order.save();

  const response = await request(app)
    .post("/api/payments/create-payment-intent")
    .set("Cookie", global.createCookie(order.userId))
    .send({
      token: "asdfasd",
      orderId: order.id,
    })
    .expect(200);

  expect(response.body.paymentIntent).not.toBeNull();

  const paymentIntent = await stripe.paymentIntents.retrieve(
    response.body.paymentIntent.id,
  );

  expect(paymentIntent.id).toEqual(response.body.paymentIntent.id);
  expect(paymentIntent.client_secret).toEqual(
    response.body.paymentIntent.client_secret,
  );
});
