import Queue from "bull";
import { ORDER_EXPIRATION_QUEUE_NAME } from "../utils/constants";
import ExpirationCompletePublisher from "../events/publisher/expiration-complete-publisher";
import { natsWrapper } from "../nats-wrapper";

interface Payload {
  orderId: string;
}

const expirationOrderQueue = new Queue<Payload>(ORDER_EXPIRATION_QUEUE_NAME, {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationOrderQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationOrderQueue };
