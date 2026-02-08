-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "is_admin" BOOLEAN DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receivers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "children_count" INTEGER DEFAULT 0,
    "is_eligible" BOOLEAN DEFAULT true,
    "is_received" BOOLEAN DEFAULT false,
    "amount_per_packet" INTEGER DEFAULT 10,
    "cash_note" INTEGER DEFAULT 10,
    "type" TEXT DEFAULT 'family',
    "year" INTEGER DEFAULT 2026,
    "user_id" INTEGER,

    CONSTRAINT "receivers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "receivers_user_id_idx" ON "receivers"("user_id");

-- AddForeignKey
ALTER TABLE "receivers" ADD CONSTRAINT "receivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
