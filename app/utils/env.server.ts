import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string(),
  DEFAULT_DEVICE_PORT: z.string(),
  VITEST: z.boolean().optional(),
});

const clientSchema = schema.pick({ VITEST: true });

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
export function getEnv() {
  /*⛔️ env vars added here will be visible to the client*/
  const clientEnv = {
    VITEST: !!process.env.VITEST,
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

type ENV = ReturnType<typeof getEnv>;

declare global {
  let ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
