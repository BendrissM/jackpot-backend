import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

app.post(`/roll`, async (req, res) => {
  // initiate a new roll
});

app.post(`/cashout`, async (req, res) => {
  // initiate a cashout
});

app.get(`/accounts/:id`, async (req, res) => {
  const result = await prisma.account.findFirst({
    where: {
      id: req.params.id,
    },
  });

  console.log(result)
  
  if (!result) {
    return res.status(404).json({ error: "Account Not Found lol" });
  }
  
  console.log('not here');
  return res.json(result);
});

app.post(`/accounts`, async (req, res) => {
  const result = await prisma.account.create({
    data: {
      ...req.body,
    },
  });
  res.status(201).json(result);
});

export default app;
