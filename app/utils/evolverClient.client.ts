import { createClient } from "@hey-api/client-fetch";

/**
 * Creates an Evolver client for a device using its URL
 * @param url The URL of the device
 * @returns The Evolver client configured for the device
 */
export function createEvolverClient(url: string) {
  return createClient({
    baseUrl: url,
  });
}
