import axios from "axios";

export default ({ req }) => {
  // We are on the server
  if (typeof window === "undefined") {
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  }

  // we must be on the browser
  return axios.create({
    baseURL: "/",
  });
};
