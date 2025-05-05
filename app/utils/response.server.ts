import { json } from "react-router";

/**
 * This helper function helps us to return the accurate HTTP status,
 * 400 Bad Request, to the client.
 */
export const badRequest = <T>(data: T) =>
  json<T & { ok: false; status: 400 }>({
    ...data,
    ok: false,
    status: 400,
  });

/**
 * This helper function helps us to return the accurate HTTP status,
 * 500 Internal Error, to the client.
 */
export const internalError = <T>(data: T) =>
  json<T & { ok: false; status: 500 }>({
    ...data,
    ok: false,
    status: 500,
  });
