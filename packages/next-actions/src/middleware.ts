import { headers as NextHeaders } from "next/headers";
import { Context, NextFunction } from "./create-app";
import { z } from "zod";
import { formDataToObject } from "./utils";

export type HeaderContext = {
  headers: Awaited<ReturnType<typeof NextHeaders>>;
} & Context;

export const headers = async <C extends Context>(
  ctx: C,
  next: NextFunction<C>,
) => {
  const _headers = await NextHeaders();
  return next({
    ...ctx,
    headers: _headers,
  });
};

export type ValidateConfig<S extends z.ZodType<any>> = {
  schema?: S;
};

export const validate = async <C extends Context>(
  ctx: C,
  next: NextFunction<C>,
  config?: ValidateConfig<any>,
) => {
  if (ctx.input instanceof FormData) {
    ctx.input = formDataToObject(ctx.input) as any;
  }
  const { success, data, error } = config?.schema?.safeParse(ctx.input) ?? {
    success: true,
    data: ctx.input,
    error: undefined,
  };
  if (!success) {
    return JSON.stringify(error.issues, null, 2);
  }
  return next({
    ...ctx,
    input: data,
  });
};
