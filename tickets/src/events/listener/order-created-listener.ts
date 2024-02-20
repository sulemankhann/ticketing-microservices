import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@devorium/common";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "../../utils/constants";
import Ticket from "../../models/ticket";
import TicketUpdatedPublisher from "../publisher/ticket-updated-publisher";

export default class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // find and check if ticket exit
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error("ticket not found.");
    }

    // save the ticket with orderId
    ticket.set({ orderId: data.id });
    await ticket.save();

    // publish ticket updated event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      orderId: ticket.orderId,
      userId: ticket.userId,
      version: ticket.version,
    });

    // ack, msg is recevied
    msg.ack();
  }
}
