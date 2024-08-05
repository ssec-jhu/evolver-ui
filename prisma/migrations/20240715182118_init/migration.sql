-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ip_addr" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_ip_addr_key" ON "Device"("ip_addr");
