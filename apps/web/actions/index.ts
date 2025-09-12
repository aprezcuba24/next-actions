"use server";

import { app, AppContext, simpleApp } from "./app";
import { z } from "zod";

export const simpleAction = app(async () => "hello world");
export const withSimpleAction = simpleApp(async () => "Simple app");

const helloSchema = z.string();
export const helloAction = app<z.infer<typeof helloSchema>>(
  { schema: helloSchema },
  async ({ input }) => `Hello ${input}`,
);

const validateObjectSchema = z.object({
  name: z.string(),
});
export const validateObjectOption = app<z.infer<typeof validateObjectSchema>>(
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

const PersonSchema = z.object({
  name: z.coerce.string(),
  age: z.coerce.number(),
  isUser: z.coerce.boolean().default(false),
});

export const formAction = app<z.infer<typeof PersonSchema>>(
  { schema: PersonSchema },
  async ({ input }) => {
    console.log(Object.entries(input), input);
    return input;
  },
);

export const typeAction = app<{ name: string }, { name: string }>(
  async ({ input }) => {
    return {
      name: `Hello ${input.name}`,
    };
  },
);

// Pipes
type PipeProps = {
  name: string;
};
const pipe1 = ({ input }: AppContext<PipeProps>) => {
  return {
    name: `${input.name} - Pipe 1`,
    lastName: "Doe",
  };
};
const pipe2 = ({ input }: AppContext<PipeProps & ReturnType<typeof pipe1>>) => {
  return {
    name: `${input.name} ${input.lastName} - Pipe 2`,
  };
};
const pipe3 = ({ input }: AppContext<PipeProps & ReturnType<typeof pipe1>>) => {
  return {
    name: `${input.name} ${input.lastName} - Pipe 3`,
  };
};
export const pipeAction = app<PipeProps>(pipe1, pipe2, pipe3);
