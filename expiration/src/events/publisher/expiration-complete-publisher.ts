import { ExpirationCompleteEvent, Publisher, Subjects } from "@devorium/common";

export default class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
