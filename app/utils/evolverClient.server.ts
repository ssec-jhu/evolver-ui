import { createClient } from "@hey-api/client-fetch";
import { db } from "~/utils/db.server";

/**
 * Creates an Evolver client for a device by ID
 * @param deviceId The ID of the device to create a client for
 * @returns The Evolver client and device URL
 * @throws Error if the device is not found
 */
export async function getEvolverClientForDevice(deviceId: string) {
  const targetDevice = await db.device.findUnique({
    where: { device_id: deviceId },
  });

  if (!targetDevice) {
    throw new Error("Device not found");
  }

  const { url } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });

  return { evolverClient, url };
}
