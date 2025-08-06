import { headers as NextHeaders } from 'next/headers';
import { Context, NextFunction } from '@/create-app';

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
