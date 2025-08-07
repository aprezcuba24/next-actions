import { createApp, validate } from "next-actions";

const app = createApp();
app.use(validate)

export default app;
