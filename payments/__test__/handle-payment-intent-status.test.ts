import request from "supertest";
import app from "../src/app";
import Order from "../src/models/order";
import mongoose from "mongoose";
import { OrderStatus } from "@devorium/common";
import { stripe } from "../src/stripe";
import Payment from "../src/models/payment";
import { natsWrapper } from "../src/nats-wrapper";

const setup = async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 20,
  });

  await order.save();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.price * 100,
    currency: "usd",
    payment_method: "pm_card_visa",
    confirm: true,
    off_session: true,
    metadata: {
      userId: order.userId,
      orderId: order.id,
    },
  });

  return { order, paymentIntent };
};

it("creates a payment record if the payment intent is successed", async () => {
  const { order, paymentIntent } = await setup();

  const response = await request(app)
    .post("/api/payments/handle-payment-intent-status")
    .set("Cookie", global.createCookie(order.userId))
    .send({
      paymentIntentId: paymentIntent.id,
    })
    .expect(201);

  expect(response.body.id).not.toBeNull();

  const payment = await Payment.findById(response.body.id);

  expect(payment?.stripeId).toEqual(paymentIntent.id);
  expect(payment?.orderId).toEqual(order.id);
});

it("emit a payment:created event", async () => {
  const { order, paymentIntent } = await setup();

  const response = await request(app)
    .post("/api/payments/handle-payment-intent-status")
    .set("Cookie", global.createCookie(order.userId))
    .send({
      paymentIntentId: paymentIntent.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
