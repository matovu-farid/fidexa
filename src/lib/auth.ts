import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins/magic-link";
import { passkey } from "@better-auth/passkey";
import { Resend } from "resend";
import { getServerConfig, isAdminEmail } from "./config";
import { getDb } from "@/db/client";

function createAuth(config: ReturnType<typeof getServerConfig>, resend: Resend) {
  return betterAuth({
  appName: "Fidexa",
  baseURL: config.betterAuthUrl,
  secret: config.betterAuthSecret,
  database: drizzleAdapter(getDb(), { provider: "pg" }),
  trustedOrigins: [config.fidexaAppUrl],
  advanced: { useSecureCookies: true },
  plugins: [
    magicLink({
      expiresIn: 600,
      storeToken: "hashed",
      sendMagicLink: async ({ email, url }) => {
        if (!isAdminEmail(email, config)) return;
        await resend.emails.send({
          from: "Fidexa <hello@fidexa.org>",
          to: [email],
          subject: "Your Fidexa admin sign-in link",
          text: `Sign in to Fidexa admin: ${url}`,
          html: `<p>Sign in to Fidexa admin.</p><p><a href="${url}">Continue to Fidexa</a></p><p>This link expires in 10 minutes.</p>`,
        });
      },
    }),
    passkey({ rpID: new URL(config.betterAuthUrl).hostname, rpName: "Fidexa" }),
  ],
  });
}

type AuthInstance = ReturnType<typeof createAuth>;
let authInstance: AuthInstance | undefined;

export function getAuth(): AuthInstance {
  if (!authInstance) {
    const config = getServerConfig();
    authInstance = createAuth(config, new Resend(config.resendApiKey));
  }
  return authInstance;
}

export async function getAdminSession(headers: Headers) {
  try {
    const config = getServerConfig();
    const session = await getAuth().api.getSession({ headers });
    if (!session || !isAdminEmail(session.user.email, config)) return null;
    return session;
  } catch {
    return null;
  }
}
