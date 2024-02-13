import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app";

let mongo: any;

declare global {
  var createCookie: () => [string];
}

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";

  mongo = await MongoMemoryServer.create();
  const mongoURI = mongo.getUri();

  await mongoose.connect(mongoURI);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.createCookie = () => {
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const sessionJSON = JSON.stringify({ jwt: token });
  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`session=${base64}`];
};
