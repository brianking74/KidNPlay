import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { env } from "./lib/env";
import { getSessionCookieOptions } from "./lib/cookies";
import { Session } from "@contracts/constants";
import { signSessionToken } from "./kimi/session";
import { upsertUser } from "./queries/users";

/**
 * Dev-mode auth bypass.
 * Creates a test user + session cookie without Kimi OAuth.
 * Only available when !env.isProduction.
 */
export function createDevLoginHandler() {
  return async (c: Context) => {
    if (env.isProduction) {
      return c.json({ error: "Not available in production" }, 403);
    }

    const body = await c.req.json().catch(() => ({}));
    const name = body.name || "Test Parent";
    const fakeUnionId = `dev-${Date.now()}`;

    await upsertUser({
      unionId: fakeUnionId,
      name: name,
      avatar: "",
      lastSignInAt: new Date(),
    });

    const token = await signSessionToken({
      unionId: fakeUnionId,
      clientId: env.appId,
    });

    const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, Session.cookieName, token, {
      ...cookieOpts,
      maxAge: Session.maxAgeMs / 1000,
    });

    return c.json({ success: true, user: { name, unionId: fakeUnionId } });
  };
}
