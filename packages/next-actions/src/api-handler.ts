import { Context } from "hono";

export type HonoInput = {
  hono: [Context];
};

export const apiHandle = (action: any) => (c: Context) => {
  return action({
    hono: [c],
  });
};
