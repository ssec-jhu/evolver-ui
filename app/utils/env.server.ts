import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  DATABASE_URL: z.string(),
  DEFAULT_DEVICE_PORT: z.string(),
  VITEST: z.string().optional(),
});

const env = schema.parse(process.env);
export const ENV = env;

// Pick env variables that will be publically visible
const clientSchema = schema.pick({ VITEST: true, NODE_ENV: true });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables",
      parsed.error.flatten().fieldErrors,
    );

    throw new Error("Invalid envirmonment variables");
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getClientEnv() {
  /*⛔️ env vars added here will be visible to the client*/
  const clientEnv = {
    NODE_ENV: process.env.NODE_ENV,
  };
  const parsed = clientSchema.safeParse(clientEnv);
  if (parsed.success === false) {
    throw new Error(
      "⛔ ️new publically visible env var detected, env vars added here will be visible on the client did you consider the security implications?",
    );
  }
  if (parsed.success === true) {
    return clientEnv;
  }
}
