import { db } from "~/utils/db.server";
import type { Device } from "@prisma/client";

/**
 * Gets device data from the database by ID
 * @param deviceId The ID of the device to fetch
 * @returns The device data from the database
 * @throws Error if the device is not found
 */

export async function getDeviceById(deviceId: string): Promise<Device> {
  const device = await db.device.findUnique({
    where: { device_id: deviceId },
  });

  if (!device) {
    throw new Error("Device not found");
  }

  return device;
}
