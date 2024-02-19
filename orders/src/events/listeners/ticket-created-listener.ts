import { Listener, Subjects, TicketCreatedEvent } from "@devorium/common";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "../../utils/constants";
import Ticket from "../../models/ticket";

export default class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;

    const ticket = Ticket.build({ id, title, price });
    await ticket.save();

    msg.ack();
  }
}
