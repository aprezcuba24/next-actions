# next-server-functions

**A lightweight framework-style utility for building action-based APIs in Next.js.**

The core of this library revolves around the `createApp` function. It allows you to define an application instance (`app`) with optional configuration, middleware, and handlers, giving you a clean, organized, and type-safe way to manage server actions.

---

## ✨ Features

- 🏗 **Composable API** — Define an `app` and register actions in a structured way.
- ⚡ **Type-Safe** — Fully compatible with TypeScript.
- 🧩 **Middleware Support** — Add reusable logic across all actions.
- 🛠 **Configurable** — Pass configuration objects per action or globally.
- 🚀 **Next.js Friendly** — Ideal for Next.js server actions or any server-side function.

---

## 📦 Installation

```bash
npm install next-server-functions
# or
yarn add next-server-functions
# or
pnpm add next-server-functions
```

---

## 🚀 Getting Started

### Create Your App

```ts
import { createApp } from "next-server-functions";

// Create the app instance
const app = createApp();
```

---

### Register Actions

An action is defined by calling `app(config?, handler)`.  
The `config` parameter is **optional** and can hold metadata, validation rules, or other action-specific settings.

```ts
const action = app(
  {
    // Configuration object
  },
  async () => {
    // Your server action logic here
    return { message: "Hello from server action!" };
  },
);
```

You can also omit `config`:

```ts
const action = app(async () => {
  return { data: "No config here" };
});
```

---

### The input parameter

The actions receive a context object that will contain a field named input with the data passed to the action.

```ts
app(
  {
    // Configuration object
  },
  async ({ input }) => {
    // Your server action logic here
    return { message: `Hello ${input}` };
  },
);
```

---

### Add Middleware

Middleware functions allow you to inject **horizontal logic** into the application.  
They can:

- Modify the input parameters.
- Stop the execution flow entirely.
- Add shared context for all actions.

```ts
app.use(async (context, next) => {
  console.log("Incoming params:", context.params);

  // Example: block request if missing token
  if (!context.params.token) {
    throw new Error("Unauthorized");
  }

  // Continue execution
  return await next();
});
```

---

### Run Your App

Once your app is set up, you can execute the registered actions with your own routing or trigger logic.

```ts
const result = await app({ some: "input" });
console.log(result);
```

---

## 🧩 API Overview

### `createApp()`

Creates an `app` instance.

**Returns:**  
A callable function `app(config?, handler)` with additional methods like `.use()` for middleware registration.

---

### `app(config?, handler)`

Registers an action in the app.

- `config` _(optional)_ — Object with action-specific configuration.
- `handler` — The async function that contains your action logic.

---

### `app.use(middleware)`

Registers a middleware function.

A middleware is an async function `(context, next, config) => any` where:

- `context` contains the incoming parameters and shared state.
- `next` calls the next middleware or the final handler.
- `config` is the configuration object passed to the action.

---

### Middleware in the package

The package provides some middleware functions that you can use out of the box.

`headers` that is a wrapper of `import { headers } from "next/headers";`

```ts
import { headers } from "next-server-functions";

app.use(headers);
```

`validate` that use `zod` to validate the input parameters.

```ts
import { validate } from "next-server-functions";
//...
app.use(validate);

//Now you can use it

const userSchema = z.object({
  name: z.string(),
});
const registerUser = app({ schema: userSchema }, async ({ input }) => {
  return `User registered: ${input.name}`;
});
```

---

### Typescript

The package is fully compatible with TypeScript. When you create an app you can pass what is the type of the config and the context.

Suppose the following example.

- Use the validate and the header middleware.
- Create a custom middleware to control the security.

```ts
import {
  createApp,
  validate,
  headers,
  NextFunction,
  Context,
  ValidateConfig,
  HeaderContext,
} from "next-server-functions";
import { z } from "zod";

// Create the custom middleware.

// The actions can pass as config the roles that the user needs to execute it.
export type UserConfig = {
  roles?: string[];
};
// The context will have a new field whit the current user.
export type UserContext = {
  user: any;
};

// The middleware
export const user = async <C extends Context>(
  ctx: C,
  next: NextFunction<C>,
  config?: UserConfig,
) => {
  let user;
  if (config?.roles) {
    // the logic to validate the roles and return the user.
  }
  return next({ ...ctx, user });
};

// Pass the types when create the app
export type AppConfig = ValidateConfig<any> & UserConfig;
export type AppContext = HeaderContext & UserContext;
const app = createApp<AppContext, AppConfig>();
app.use(headers);
app.use(validate);

const userSchema = z.object({
  name: z.string(),
});
const registerUser = app({ schema: userSchema }, async ({ input }) => {
  return `User registered: ${input.name}`;
});
```

---

## Pipes

Pipes are one of the core features of this library.  
They allow you to compose functions step by step, where each function receives the accumulated output of all previous ones.  
This ensures **type safety** while keeping your code modular and easy to read.

### Example

```ts
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

const result = pipeAction({ name: "John" });
console.log(result);
// {
//   name: "John - Pipe 1 Doe - Pipe 2 Doe - Pipe 3",
//   lastName: "Doe"
// }
```

### Why Pipes?

- **Type-safe composition**: each pipe knows exactly what data it receives.
- **Extendable**: add or remove steps without breaking type contracts.
- **Reusable**: each pipe is a pure function that can be shared across contexts.

---

## 📄 License

MIT © [Renier](https://github.com/aprezcuba24)
