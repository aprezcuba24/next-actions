import { describe, expect, it } from 'vitest';
import { createApp } from '@/create-app';
import { z } from 'zod';

describe('createApp', () => {
  it('should create an app', () => {
    const app = createApp();
    expect(app).toBeDefined();
  });

  it('should create an app with middleware', async () => {
    const app = createApp();
    app.use((ctx, next) => {
      ctx.input = 'hello';
      return next(ctx);
    });
    const action = app(async ({ input }) => input + ' world');
    const result = await action();
    expect(result).toBe('hello world');
  });

  it('should create an app with middleware and input validation', async () => {
    const app = createApp();
    const schema = z.object({ name: z.string() });
    const action = app({ input: schema }, async ({ input: { name } }) => name + ' world');
    const result = await action({ name: 'hello' });
    expect(result).toBe('hello world');
  });
});
