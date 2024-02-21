import { Listener, OrderCreatedEvent, Subjects } from "@devorium/common";
import { QUEUE_GROUP_NAME } from "../../utils/constants";
import { Message } from "node-nats-streaming";
import { expirationOrderQueue } from "../../queues/order-expiration-queue";

export default class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    console.log("Waiting this many millisecond to process this job: ", delay);

    await expirationOrderQueue.add(
      { orderId: data.id },
      {
        delay,
      },
    );

    msg.ack();
  }
}
