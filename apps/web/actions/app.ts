import {
  createApp,
  validate,
  ValidateConfig,
  HeaderContext,
  headers,
  Context,
  NextFunction,
} from "next-server-functions";

export type UserConfig = {
  roles?: string[];
};
export type UserContext = {
  user: any;
};

export const user = async <C extends Context>(
  ctx: C,
  next: NextFunction<C>,
  config?: UserConfig,
) => {
  let user;
  if (config?.roles) {
    user = {
      name: "user1",
      roles: config.roles,
    }; //Load user with your logic
  }
  return next({ ...ctx, user });
};

export type AppConfig = ValidateConfig<any> & UserConfig;
export type AppContext = HeaderContext & UserContext;

export const app = createApp<AppContext, AppConfig>();
app.use(headers);
app.use(validate);
app.use(user);

export const simpleApp = createApp();
