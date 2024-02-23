import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@devorium/common";
import { QUEUE_GROUP_NAME } from "../../utils/constants";
import { Message } from "node-nats-streaming";
import Order from "../../models/order";

export default class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Order("order not found");
    }

    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    msg.ack();
  }
}
