-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "sid" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_sid_key" ON "Message"("sid");
