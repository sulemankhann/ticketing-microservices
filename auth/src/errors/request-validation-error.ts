import { ValidationError } from "express-validator";
import CustomError from "./custom-error";

export default class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      return err.type === "field"
        ? {
            message: err.msg,
            field: err.path,
          }
        : {
            message: err.msg,
          };
    });
  }
}
