import { headers as NextHeaders } from 'next/headers';
import { Context, NextFunction } from '@/create-app';
import { z } from 'zod';
import { formDataToObject } from '@/utils';

export type HeaderContext = {
  headers: Awaited<ReturnType<typeof NextHeaders>>;
} & Context;

export const headers = async (ctx: Context, next: NextFunction<HeaderContext>) => {
  const _headers = await NextHeaders();
  return next({
    ...ctx,
    headers: _headers,
  });
};

export type ValidateConfig<S extends z.ZodType<any>> = {
  schema: S;
};

export const validate = async (
  ctx: Context,
  next: NextFunction<Context>,
  config: ValidateConfig<any>
) => {
  if (ctx.input instanceof FormData) {
    ctx.input = formDataToObject(ctx.input) as any;
  }
  const input = config.schema ? config.schema.parse(ctx.input) : (ctx.input as any);
  return next({
    ...ctx,
    input,
  });
};
