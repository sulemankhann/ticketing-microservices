import axios from "axios";
import Link from "next/link";

export default function LandingPage({ tickets, currentUser }) {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href={`tickets/${ticket.id}`}>View</Link>
        </td>
      </tr>
    );
  });

  return (
    <div style={{ marginTop: "30px" }}>
      <h1>Tickets</h1>
      <hr />
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
}

LandingPage.getInitialProps = async (context, client) => {
  const { data } = await client.get("/api/tickets");

  return { tickets: data };
};
