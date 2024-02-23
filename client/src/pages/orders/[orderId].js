import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import useRequest from "../../hooks/useRequest";
import CheckoutForm from "../../components/CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

export default function OrderShow({ order }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const { sendRequest, errors } = useRequest();

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    // create payment intent to get secret
    // to show payment page
    sendRequest({
      url: "/api/payments/create-payment-intent",
      method: "post",
      body: {
        orderId: order.id,
      },
      onSucess: (data) => setClientSecret(data.paymentIntent.client_secret),
    });

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="mt-2">
      <p>{timeLeft} seconds until order expires </p>

      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};
