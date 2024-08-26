import { createClient } from "@hey-api/client-fetch";
import * as Evolver from "client/services.gen";
import { ENV } from "~/utils/env.server";

export async function pingDevice(
  evolver_url_addr: string,
  timeout = 4000,
): Promise<{ online: boolean; name: string }> {
  const controller = new AbortController();
  const { signal } = controller;

  const evolverClient = createClient({
    baseUrl: evolver_url_addr,
  });
  // Set a timeout to abort the fetch request
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const { response } = await Evolver.healthcheck({
      client: evolverClient,
      signal,
    });

    clearTimeout(timeoutId); // Clear the timeout if fetch is successful
    if (response && response.status && response.status !== 200) {
      return { online: false, name: "unknown" };
    }
    // get the evolver name too.
    const evolverDescription = await Evolver.describe({
      client: evolverClient,
    });
    // TODO: Confirm this is all accessible
    const {
      config: { name },
      id,
    } = evolverDescription.data;

    return { online: true, name, id };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.info(
        `request to device ${evolver_url_addr} timed out after ${timeout}ms, now designated offline`,
      );
    }
    return { online: false, name: "unknown", id: "unknown" };
  }
}
