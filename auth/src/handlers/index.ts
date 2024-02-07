import { validationResult } from "express-validator";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../models/user";
import RequestValidationError from "../errors/request-validation-error";
import BadRequestError from "../errors/bad-request-error";
import { Password } from "../utils/password";

export const signup = async (req: Request, res: Response) => {
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

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new BadRequestError("Invalid credentials");
  }

  const isPasswordMatch = await Password.compare(
    password,
    existingUser.password,
  );

  if (!isPasswordMatch) {
    throw new BadRequestError("Invalid credentials");
  }

  // Generate JWT
  const userJWT = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
    },
    process.env.JWT_KEY!,
  );

  // Store JWT in session
  req.session = {
    jwt: userJWT,
  };

  res.status(200).send(existingUser);
};

export const currentUser = async (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser || null });
};

export const signout = async (req: Request, res: Response) => {
  req.session = null;

  res.send({});
};
