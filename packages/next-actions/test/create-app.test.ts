import { describe, expect, it, vi } from "vitest";
import { Context, createApp } from "../src/create-app";
import { z } from "zod";
import {
  HeaderContext,
  headers,
  validate,
  ValidateConfig,
} from "../src/middleware";

vi.mock("next/headers", () => ({
  headers: () =>
    new Promise((resolve) =>
      resolve({
        get: (key: string) => key,
      }),
    ),
}));

describe("createApp", () => {
  it("should create an app", () => {
    const app = createApp();
    expect(app).toBeDefined();
  });

  it("should create an app with middleware", async () => {
    const app = createApp<{ input: string }>();
    app.use((ctx, next) => {
      ctx.input = "hello";
      return next(ctx);
    });
    const action = app(async (ctx) => {
      return ctx.input + " world";
    });
    const result = await action("test");
    expect(result).toBe("hello world");
  });

  it("should create an app with middleware and input validation", async () => {
    const schema = z.object({ name: z.string() });
    const app = createApp<
      { input: z.infer<typeof schema> },
      ValidateConfig<typeof schema>
    >();
    app.use(validate);
    const action = app<any>(
      { schema },
      async ({ input: { name } }) => name + " world",
    );
    const result = await action({ name: "hello" });
    expect(result).toBe("hello world");
  });

  it("failed validation", async () => {
    const schema = z.object({ name: z.string() });
    const app = createApp<
      { input: z.infer<typeof schema> },
      ValidateConfig<typeof schema>
    >();
    app.use(validate);
    const action = app<any>(
      { schema },
      async ({ input: { name } }) => name + " world",
    );
    const result = await action({ name: 5 });
    expect(JSON.parse(result)).toEqual([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["name"],
        message: "Expected string, received number",
      },
    ]);
  });

  it("Headers", async () => {
    const app = createApp<Context & HeaderContext>();
    app.use(headers);
    const action = app(async ({ headers }) => headers.get("x-header"));
    const result = await action();
    expect(result).toBe("x-header");
  });

  it("Middleware order", async () => {
    const app = createApp<{ input: string }>();
    app.use((ctx, next) => {
      ctx.input = "hello";
      return next(ctx);
    });
    app.use((ctx, next) => {
      ctx.input += " world";
      return next(ctx);
    });
    const action = app(async (ctx) => {
      return ctx.input + " test";
    });
    const result = await action("test");
    expect(result).toBe("hello world test");
  });

  it("FormData", async () => {
    const formData = new FormData();
    formData.append("name", JSON.stringify("John"));
    formData.append("lastName", JSON.stringify("Doe"));
    const schema = z.object({ name: z.string(), lastName: z.string() });
    const app = createApp<
      { input: z.infer<typeof schema> },
      ValidateConfig<typeof schema>
    >();
    app.use(validate);
    const action = app<any>(
      { schema },
      async ({ input: { name, lastName } }) => name + " " + lastName,
    );
    const result = await action(formData);
    expect(result).toBe("John Doe");
  });

  it("Abort process", async () => {
    const app = createApp<{ input: number }>();
    app.use((ctx, next) => {
      return ctx.input < 0 ? "stop" : next(ctx);
    });
    const action = app(async (ctx) => {
      return "continue";
    });
    expect(await action(-1)).toBe("stop");
    expect(await action(1)).toBe("continue");
  });

  it("Process after", async () => {
    const app = createApp();
    app.use(async (ctx, next) => {
      const result = await next(ctx);
      return result + " after";
    });
    const action = app(async () => {
      return "action";
    });
    expect(await action()).toBe("action after");
  });
});
