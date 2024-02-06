import { validationResult } from "express-validator";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import RequestValidationError from "../errors/request-validation-error";
import User from "../models/user";
import BadRequestError from "../errors/bad-request-error";

export const signup = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }

  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new BadRequestError("Email is already in use");
  }

  const user = User.build({ email, password });
  await user.save();

  // Generate JWT
  const userJWT = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_KEY!,
  );

  // Store JWT in session
  req.session = {
    jwt: userJWT,
  };

  res.status(201).send(user);
};
