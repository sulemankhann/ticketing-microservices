import { useState } from "react";
import useRequest from "../../hooks/useRequest";
import Router from "next/router";

export default function CreateTicket() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const { sendRequest, errors } = useRequest();

  const onBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    sendRequest({
      url: "/api/tickets",
      method: "post",
      body: {
        title,
        price,
      },
      onSucess: () => Router.push("/"),
    });
  };

  return (
    <div>
      <h1>Create a Ticket</h1>

      <hr />
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            className="form-control"
          />
        </div>

        <div className="form-group mb-4">
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur}
            onChange={(e) => setPrice(e.target.value)}
            type="text"
            className="form-control"
          />
        </div>

        {errors}
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}
