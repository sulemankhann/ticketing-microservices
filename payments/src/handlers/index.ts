import { Router, Request, Response } from "express";
import Order from "../models/order";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
} from "@devorium/common";
import { stripe } from "../stripe";
import Payment from "../models/payment";
import PaymentCreatedPublisher from "../events/publisher/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

export const createPaymentIntent = async (req: Request, res: Response) => {
  const { token, orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError();
  }

  if (req.currentUser?.id !== order.userId) {
    throw new NotAuthorizedError();
  }

  if (order.status === OrderStatus.Cancelled) {
    throw new BadRequestError("Cannot pay for an cancelled order");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.price * 100,
    currency: "usd",
    automatic_payment_methods: {
      enabled: false,
    },
    payment_method_types: ["card"],
    metadata: {
      userId: order.userId,
      orderId: order.id,
    },
  });

  res.send({
    paymentIntent,
  });
};

export const handlePaymentIntentStatus = async (
  req: Request,
  res: Response,
) => {
  const { paymentIntentId } = req.body;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === "succeeded") {
    const payment = Payment.build({
      orderId: paymentIntent.metadata.orderId,
      stripeId: paymentIntent.id,
    });

    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    return res.status(201).send({
      id: payment.id,
    });
  }

  res.send({ paymentIntent });
};
