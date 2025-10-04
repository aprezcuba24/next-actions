import { Context } from "hono";

export type HonoInput = [Context];

export const apiHandle = (action: any) => (c: Context) => {
  return action([c]);
};
