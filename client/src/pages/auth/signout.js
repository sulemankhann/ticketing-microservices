import { useEffect } from "react";
import useRequest from "../../hooks/useRequest";
import Router from "next/router";

export default function Signout() {
  const { sendRequest, errors } = useRequest();

  useEffect(() => {
    sendRequest({
      url: "/api/users/signout",
      method: "post",
      body: {},
      onSucess: () => Router.push("/"),
    });
  }, []);

  return <div>Signing you out...</div>;
}
