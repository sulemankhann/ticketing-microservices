import request from "supertest";
import app from "../src/app";
import Ticket from "../src/models/ticket";
import { natsWrapper } from "../src/nats-wrapper";

it("has a route handler listning to /api/tickets for post request", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 401 if the user is singed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.createCookie())
    .send({});

  expect(response.statusCode).not.toEqual(401);
});

it("returns and error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.createCookie())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.createCookie())
    .send({
      price: 10,
    })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.createCookie())
    .send({
      title: "test title",
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.createCookie())
    .send({
      title: "test title",
    })
    .expect(400);
});

it("create a ticket with valid input", async () => {
  // TODO: add a check to make sure ticket is saved in db
  const title = "a test title";
  let tickets = await Ticket.find({});

  expect(tickets.length).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.createCookie())
    .send({
      title,
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual(title);
});

it("publishes an event", async () => {
  const title = "a test title";
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.createCookie())
    .send({
      title,
      price: 20,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
