import { Publisher, Subjects, OrderCreatedEvent } from "@devorium/common";

export default class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
