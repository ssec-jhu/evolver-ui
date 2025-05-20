import { http, HttpResponse } from "msw";
import { db } from "./db-data";

/**
 * MSW handlers for intercepting database operations
 *
 * In a real application, these would be fetches to a database API,
 * but in our app we're mocking Prisma client calls directly in our server code.
 *
 * This approach requires a different strategy - we'll need to mock the Prisma client.
 * These handlers are here as a reference for the approach, but won't be used directly.
 */
export const dbHandlers = [
  // Mock findUnique for device
  http.get("/api/device/:id", ({ params }) => {
    const { id } = params;
    const device = db.device.findFirst({
      where: {
        device_id: {
          equals: id,
        },
      },
    });

    return device
      ? HttpResponse.json(device)
      : new HttpResponse(null, { status: 404 });
  }),

  // Mock findMany for devices
  http.get("/api/devices", () => {
    const devices = db.device.getAll();
    return HttpResponse.json(devices);
  }),

  // Mock create for device
  http.post("/api/devices", async ({ request }) => {
    const deviceData = await request.json();

    try {
      const existingDevice = db.device.findFirst({
        where: {
          url: {
            equals: deviceData.url,
          },
        },
      });

      if (existingDevice) {
        return new HttpResponse(
          JSON.stringify({ error: "Device already exists" }),
          {
            status: 400,
          },
        );
      }

      const newDevice = db.device.create(deviceData);
      return HttpResponse.json(newDevice);
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ error: "Unable to create device" }),
        {
          status: 500,
        },
      );
    }
  }),

  // Mock delete for device
  http.delete("/api/devices/:id", ({ params }) => {
    const { id } = params;

    try {
      const device = db.device.findFirst({
        where: {
          device_id: {
            equals: id,
          },
        },
      });

      if (!device) {
        return new HttpResponse(null, { status: 404 });
      }

      db.device.delete({
        where: {
          id: {
            equals: device.id,
          },
        },
      });

      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return new HttpResponse(null, { status: 500 });
    }
  }),
];
