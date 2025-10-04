import { Hono } from "hono";
import { handle } from "hono/vercel";
import { app, AppConfig, AppContext } from "../../../actions/app";
import { createApi } from "next-server-functions";

const api = createApi<AppContext, AppConfig>(app);

const hono = new Hono().basePath("/api");

hono.get("/echo", api({ roles: ["admin"] }), async (c) => {
  console.log(c.get("context").user);
  return c.text(`Echo: ${c.get("context").headers.get("token")}`);
});

const handler = handle(hono);

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
export const HEAD = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;

export default hono;
