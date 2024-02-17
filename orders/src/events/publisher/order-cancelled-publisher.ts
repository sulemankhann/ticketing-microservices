import { Publisher, Subjects, OrderCancelledEvent } from "@devorium/common";

export default class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
