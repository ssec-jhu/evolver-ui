import { db } from "./db-data";

/**
 * Mock implementation of the Prisma client for use in integration tests
 * This mock client is a wrapper around a msw data api.
 */
export const mockPrismaClient = {
  device: {
    findUnique: async ({ where }) => {
      // If looking up by device_id
      if (where.device_id) {
        return db.device.findFirst({
          where: {
            device_id: {
              equals: where.device_id,
            },
          },
        });
      }

      // If looking up by id
      if (where.id) {
        return db.device.findFirst({
          where: {
            id: {
              equals: where.id,
            },
          },
        });
      }

      // If looking up by URL
      if (where.url) {
        return db.device.findFirst({
          where: {
            url: {
              equals: where.url,
            },
          },
        });
      }

      return null;
    },

    findMany: async () => {
      return db.device.getAll();
    },

    create: async ({ data }) => {
      // Check if device with this URL already exists
      const existingDevice = db.device.findFirst({
        where: {
          url: {
            equals: data.url,
          },
        },
      });

      if (existingDevice) {
        throw new Error("Device with this URL already exists");
      }

      return db.device.create({
        id: data.id || `id-${Date.now()}`,
        url: data.url,
        device_id: data.device_id,
        name: data.name || "bioreactor",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },

    delete: async ({ where }) => {
      const device = db.device.findFirst({
        where: {
          device_id: {
            equals: where.device_id,
          },
        },
      });

      if (!device) {
        throw new Error("Device not found");
      }

      db.device.delete({
        where: {
          id: {
            equals: device.id,
          },
        },
      });

      return device;
    },
  },
};
