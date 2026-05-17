-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "primary_contact_id" INTEGER;

-- AlterTable
ALTER TABLE "user_preferences" ADD COLUMN     "gmail_refresh_token" TEXT,
ADD COLUMN     "gmail_token" TEXT,
ADD COLUMN     "last_gmail_sync_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "deal_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255),
    "role" VARCHAR(100),
    "company" VARCHAR(255),
    "linkedin_url" VARCHAR(255),
    "notes" TEXT,
    "last_contacted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_user_id_idx" ON "contacts"("user_id");

-- CreateIndex
CREATE INDEX "contacts_deal_id_idx" ON "contacts"("deal_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_deal_id_email_key" ON "contacts"("deal_id", "email");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
