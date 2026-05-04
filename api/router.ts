import { authRouter } from "./auth-router";
import { activityRouter } from "./activity-router";
import { userRouter } from "./user-router";
import { planRouter } from "./plan-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  activity: activityRouter,
  user: userRouter,
  plan: planRouter,
});

export type AppRouter = typeof appRouter;
