-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "url" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'unknown'
);
INSERT INTO "new_Device" ("createdAt", "device_id", "id", "updatedAt", "url") SELECT "createdAt", "device_id", "id", "updatedAt", "url" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
CREATE UNIQUE INDEX "Device_url_key" ON "Device"("url");
CREATE UNIQUE INDEX "Device_device_id_key" ON "Device"("device_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
