import { Listener, Subjects, TicketUpdatedEvent } from "@devorium/common";
import { QUEUE_GROUP_NAME } from "../../utils/constants";
import { Message } from "node-nats-streaming";
import Ticket from "../../models/ticket";

export default class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { id, title, price } = data;
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
