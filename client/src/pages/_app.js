import "bootstrap/dist/css/bootstrap.css";
import Header from "../components/header";
import axiosClient from "../utils/axiosClient";

export default function AppComponent({ Component, pageProps, currentUser }) {
  return (
    <>
      <Header currentUser={currentUser} />
      <div className="mx-2">
        <Component {...pageProps} />
      </div>
    </>
  );
}

AppComponent.getInitialProps = async ({ ctx, Component }) => {
  const client = axiosClient(ctx);
  let pageProps = {};
  let data = {};

  try {
    const response = await client.get("/api/users/currentuser");

    data = response.data;
  } catch (err) {
    data = { currentUser: null };
  }

  // calling page getInitialProps
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return {
    pageProps,
    ...data,
  };
};
