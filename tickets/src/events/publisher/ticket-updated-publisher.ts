import { Publisher, Subjects, TicketUpdatedEvent } from "@devorium/common";

export default class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
