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

export const charge = async (req: Request, res: Response) => {
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

  const charge = await stripe.charges.create({
    amount: order.price * 100,
    currency: "usd",
    source: token,
    metadata: {
      userId: order.userId,
      orderId: order.id,
    },
  });

  const payment = Payment.build({
    orderId: order.id,
    stripeId: charge.id,
  });

  await payment.save();

  new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stipeId,
  });

  res.status(201).send({
    id: payment.id,
  });
};
