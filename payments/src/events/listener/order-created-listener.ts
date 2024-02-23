import { Listener, OrderCreatedEvent, Subjects } from "@devorium/common";
import { QUEUE_GROUP_NAME } from "../../utils/constants";
import { Message } from "node-nats-streaming";
import Order from "../../models/order";

export default class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      version: data.version,
      userId: data.userId,
      status: data.status,
      price: data.ticket.price,
    });

    await order.save();

    msg.ack();
  }
}
