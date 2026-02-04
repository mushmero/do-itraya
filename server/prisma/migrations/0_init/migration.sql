-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "receivers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "children_count" INTEGER DEFAULT 0,
    "is_eligible" INTEGER DEFAULT 1,
    "is_received" INTEGER DEFAULT 0,
    "amount_per_packet" INTEGER DEFAULT 10,
    "cash_note" INTEGER DEFAULT 10,
    "type" TEXT DEFAULT 'family',
    "year" INTEGER DEFAULT 2026,
    "user_id" INTEGER,
    CONSTRAINT "receivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_users_1" ON "users"("email");
Pragma writable_schema=0;

-- CreateIndex
CREATE INDEX "receivers_user_id_idx" ON "receivers"("user_id");

