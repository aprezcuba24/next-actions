"use server";

import app from "./app";
import { z } from "zod";

const helloSchema = z.string();
export const helloAction = app(
  { schema: helloSchema },
  async ({ input }) => `Hello ${input}`,
);
