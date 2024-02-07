import { Request, Response, NextFunction } from "express";
import { ValidationError } from "express-validator";
import CustomError from "../errors/custom-error";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({
      errors: err.serializeErrors(),
    });
  }

  res.status(500).send({
    errors: [{ message: "Something went wrong" }],
  });
};

export default errorHandler;
