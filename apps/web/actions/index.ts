"use server";

import app from "./app";
import { z } from "zod";

export const simpleAction = app(async () => "hello world");

const helloSchema = z.string();
export const helloAction = app(
  { schema: helloSchema },
  async ({ input }) => `Hello ${input}`,
);

const validateObjectSchema = z.object({
  name: z.string(),
});
export const validateObjectOption = app(
  { schema: validateObjectSchema },
  async ({ input, headers }) => {
    console.log(headers.get("x-header"));
    return `Name: ${input.name}`;
  },
);

export const doWithUserAction = app(
  { roles: ["ADMIN", "USER"] },
  async ({ user }) => user,
);
