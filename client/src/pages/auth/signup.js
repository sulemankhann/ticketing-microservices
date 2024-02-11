import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/useRequest";

export default () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { sendRequest, errors } = useRequest();

  const onSubmit = async (event) => {
    event.preventDefault();

    sendRequest({
      url: "/api/users/signup",
      method: "post",
      body: {
        email,
        password,
      },
      onSucess: (data) => Router.push("/"),
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          className="form-control"
        />
      </div>
      <div className="form-group mb-4">
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-control"
        />
      </div>

      {errors}
      <button className="btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};
