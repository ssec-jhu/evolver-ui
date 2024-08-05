import { createClient } from "@hey-api/client-fetch";
import * as Evolver from "client/services.gen";

export async function pingDevice(ip: string, timeout = 4000) {
  const controller = new AbortController();
  const { signal } = controller;

  const evolverClient = createClient({
    baseUrl: `http://${ip}:${process.env.DEFAULT_DEVICE_PORT}`,
  });
  // Set a timeout to abort the fetch request
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const { response } = await Evolver.healthzHealthzGet({
      client: evolverClient,
      signal,
    });
    clearTimeout(timeoutId); // Clear the timeout if fetch is successful
    if (response && response.status && response.status !== 200) {
      return false;
    }
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.info(
        `request to device ${ip} timed out after ${timeout}ms, now designated offline`,
      );
    }
    return false;
  }
}
