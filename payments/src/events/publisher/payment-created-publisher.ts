import { PaymentCreatedEvent, Publisher, Subjects } from "@devorium/common";

export default class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
