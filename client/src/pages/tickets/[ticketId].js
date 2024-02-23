import Router from "next/router";
import useRequest from "../../hooks/useRequest";

export default function TicketShow({ ticket }) {
  const { sendRequest, errors } = useRequest();

  const onPurchase = async () => {
    sendRequest({
      url: "/api/orders",
      method: "post",
      body: {
        ticketId: ticket.id,
      },
      onSucess: (order) => Router.push(`/orders/${order.id}`),
    });
  };

  return (
    <div style={{ marginTop: "30px" }}>
      {errors}
      <h1> {ticket.title} </h1>
      <h4>Price: ${ticket.price} </h4>
      <button className="btn btn-primary" onClick={onPurchase}>
        Purchase
      </button>
    </div>
  );
}

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};
