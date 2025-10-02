import { Hono } from "hono";
import { handle } from "hono/vercel";
import { app } from "../../../actions/app";
import { HonoInput, apiHandle } from "next-server-functions";

const action = app<HonoInput>(
  async ({
    input: {
      hono: [c],
    },
    user,
  }) => {
    return c.json({
      message: `Hello Next.js! ahora si ff222 ${c.req.param("name")}`,
      user,
    });
  },
);

const hono = new Hono().basePath("/api");

hono.get("/hello-world/:name", apiHandle(action));

const handler = handle(hono);

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
export const HEAD = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;

export default hono;
