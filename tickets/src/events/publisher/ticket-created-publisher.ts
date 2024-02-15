import { Publisher, Subjects, TicketCreatedEvent } from "@devorium/common";

export default class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
