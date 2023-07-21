-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sid" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "status" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_sid_key" ON "Message"("sid");
