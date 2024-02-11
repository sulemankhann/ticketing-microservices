import axios from "axios";
import { useEffect, useState } from "react";

export default () => {
  const [errors, setErrors] = useState(null);

  const sendRequest = async ({ url, method, body, onSucess }) => {
    try {
      setErrors(null);
      const response = await axios[method](url, body);

      if (onSucess) {
        onSucess(response.data);
      }

      return response.data;
    } catch (error) {
      console.log(error);
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops...</h4>
          <ul>
            {error.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>,
      );
    }
  };

  return { sendRequest, errors };
};
