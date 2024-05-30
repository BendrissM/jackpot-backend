import request from "supertest";
import app from "./app";
import crypto from "crypto";
import { prismaMock } from "../singleton";

describe("Test endpoints", () => {
  let accountId = crypto.randomUUID();
  let sessionId = crypto.randomUUID();

  it("should create a new account", async () => {
    const res = await request(app).post("/accounts").send({
      id: accountId,
      balance: 0,
    });
    expect(res.statusCode).toEqual(201);
  });

  it("should get an account", async () => {
    prismaMock.account.findFirst.mockResolvedValue({
      id: accountId,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await request(app).get(`/accounts/${accountId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(accountId);
  });

  it("should create a new session", async () => {
    const res = await request(app).post("/sessions").send({
      id: crypto.randomUUID(),
      accountId: accountId,
      credit: 100,
      state: "OPEN",
    });
    expect(res.statusCode).toEqual(201);
  });

  it("should get an open session for an account", async () => {
    prismaMock.session.findFirst.mockResolvedValue({
      id: sessionId,
      accountId: accountId,
      credit: 100,
      state: "OPEN",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).get(`/accounts/${accountId}/session`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.accountId).toEqual(accountId);
    expect(res.body.state).toEqual("OPEN");
  });

  it("should roll", async () => {
    prismaMock.session.findFirst.mockResolvedValue({
      id: sessionId,
      accountId: accountId,
      credit: 100,
      state: "OPEN",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.session.update.mockResolvedValue({
      id: sessionId,
      accountId: accountId,
      credit: 150,
      state: "OPEN",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await request(app).post("/roll").send({
      sessionId: crypto.randomUUID(),
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("rollResult");
    expect(res.body).toHaveProperty("credit");
  });

  it("should cashout", async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: sessionId,
      accountId: accountId,
      credit: 100,
      state: "OPEN",
      createdAt: new Date(),
      updatedAt: new Date(),
      account: {
        id: accountId,
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any
    });

    prismaMock.$transaction.mockResolvedValue([
      {
        id: accountId,
        balance: 200,
      },
      {
        id: sessionId,
        state: "CLOSED",
      },
    ]);

    const res = await request(app).post("/cashout").send({ sessionId });
    expect(res.statusCode).toEqual(200);
    expect(res.body.balance).toEqual(200);
    expect(res.body.sessionState).toEqual("CLOSED");
  });
});
