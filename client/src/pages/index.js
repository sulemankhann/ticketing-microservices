import axios from "axios";
import axiosClient from "../utils/axiosClient";

export default function LandingPage({ currentUser }) {
  return <h1>You are {!currentUser && "not"} signed in</h1>;
}

LandingPage.getInitialProps = async (context) => {
  const client = axiosClient(context);

  try {
    const { data } = await client.get("/api/users/currentuser");
    return data;
  } catch (err) {
    return { currentUser: null };
  }
};
