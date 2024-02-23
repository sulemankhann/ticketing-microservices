import React from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import useRequest from "../hooks/useRequest";
import Router from "next/router";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { sendRequest, errors } = useRequest();

  const [message, setMessage] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleError = (error) => {
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }
    setIsLoading(false);
  };

  const handleSuccess = (paymentIntent) => {
    sendRequest({
      url: "/api/payments/handle-payment-intent-status",
      method: "post",
      body: {
        paymentIntentId: paymentIntent.id,
      },
      onSucess: (data) => {
        Router.push("/orders");

        setIsLoading(false);
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      handleError(error);
    } else {
      handleSuccess(paymentIntent);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement
        id="payment-element"
        options={{
          layout: "tabs",
        }}
      />
      <button
        className="mt-2 btn btn-primary"
        disabled={isLoading || !stripe || !elements}
        id="submit"
      >
        {isLoading && <div className="spinner-border" role="status"></div>}
        {!isLoading && "Pay now"}
      </button>

      {message && (
        <div className="alert alert-danger">
          <h4>Ooops...</h4>
          <p>{message}</p>
        </div>
      )}
    </form>
  );
}
