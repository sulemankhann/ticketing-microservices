import request from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
import Order from "../src/models/order";
import { OrderStatus } from "@devorium/common";

import { stripe } from "../src/stripe";
import Payment from "../src/models/payment";

it("returns a 404 when purchasing an order that does not exit", async () => {
  await request(app)
    .post("/api/payments")
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
    .post("/api/payments")
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
    .post("/api/payments")
    .set("Cookie", global.createCookie(order.userId))
    .send({
      token: "asdfasd",
      orderId: order.id,
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 20,
  });

  await order.save();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", global.createCookie(order.userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });

  const stripeCharge = stripeCharges.data.find((charge) => {
    return (
      charge.metadata.orderId === order.id &&
      charge.metadata.userId === order.userId
    );
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual("usd");

  const payment = await Payment.findOne({
    stripeId: stripeCharge?.id,
    orderId: order.id,
  });

  expect(payment).not.toBeNull();
}, 10000);
