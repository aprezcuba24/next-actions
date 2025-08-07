import {
  createApp,
  validate,
  ValidateConfig,
  HeaderContext,
  headers,
} from "next-actions";

export type AppConfig = ValidateConfig;
export type AppContext = HeaderContext;

const app = createApp<AppContext, AppConfig>();
app.use(headers);
app.use(validate);

export default app;
