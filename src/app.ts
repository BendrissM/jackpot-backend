import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import { validateSessionBody, validateSessionId } from "./middlewares/session";
import { validateAccountBody } from "./middlewares/account";
import { SessionStates } from "./types/session";
import { generateRollResult } from "./utils/generateRollResult";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

app.post(`/roll`, validateSessionId, async (req, res) => {
  const sessionId = req.body.sessionId;
  const session = await prisma.session.findFirst({ where: { id: sessionId } });

  if (!session || session.state === SessionStates.CLOSED) {
    return res.status(400).json({ error: "Invalid session" });
  }

  if (session.credit <= 0) {
    return res.status(400).json({ error: "Insufficient credit" });
  }

  let rollResult = generateRollResult();

  if (
    session.credit >= 40 &&
    session.credit <= 60 &&
    rollResult.isWin &&
    Math.random() < 0.3
  ) {
    rollResult = generateRollResult();
  }

  if (session.credit > 60 && rollResult.isWin && Math.random() < 0.6) {
    rollResult = generateRollResult();
  }

  const newCredit = session.credit + rollResult.reward - 1;

  await prisma.session.update({
    where: { id: session.id },
    data: { credit: newCredit },
  });

  return res.json({ rollResult, credit: newCredit });
});

app.post(`/cashout`, validateSessionId, async (req, res) => {
  const sessionId = req.body.sessionId;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { account: true },
  });

  if (!session || session.state === SessionStates.CLOSED) {
    return res.status(400).json({ error: "Invalid session" });
  }

  const newBalance = session.account.balance + session.credit;

  const [updatedAccount, updatedSession] = await prisma.$transaction([
    prisma.account.update({
      where: { id: session.account.id },
      data: { balance: newBalance },
    }),
    prisma.session.update({
      where: { id: session.id },
      data: { state: SessionStates.CLOSED },
    }),
  ]);

  return res.json({
    balance: updatedAccount.balance,
    sessionState: updatedSession.state,
  });
});

app.get(`/accounts/:id`, async (req, res) => {
  const result = await prisma.account.findFirst({
    where: {
      id: req.params.id,
    },
  });

  // we are deliberately not checking if an account exists since we are creating it on the fly otherwise
  return res.json(result);
});

app.get(`/accounts/:id/session`, async (req, res) => {
  const result = await prisma.session.findFirst({
    where: {
      accountId: req.params.id,
      state: SessionStates.OPEN,
    },
  });

  // we are deliberately not checking if an open session exists since user can have only one open session at a time
  return res.json(result);
});

app.post(`/accounts`, validateAccountBody, async (req, res) => {
  const result = await prisma.account.create({
    data: {
      ...req.body,
    },
  });
  res.status(201).json(result);
});

app.post(`/sessions`, validateSessionBody, async (req, res) => {
  const result = await prisma.session.create({
    data: {
      ...req.body,
    },
  });
  res.status(201).json(result);
});

export default app;
