-- CreateTable
CREATE TABLE "contact_engagement_log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "deal_id" INTEGER NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "event_description" TEXT,
    "response_time" INTEGER,
    "response_required" BOOLEAN NOT NULL DEFAULT false,
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "event_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_engagement_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_engagement_log_user_id_idx" ON "contact_engagement_log"("user_id");

-- CreateIndex
CREATE INDEX "contact_engagement_log_contact_id_idx" ON "contact_engagement_log"("contact_id");

-- CreateIndex
CREATE INDEX "contact_engagement_log_deal_id_idx" ON "contact_engagement_log"("deal_id");

-- CreateIndex
CREATE INDEX "contact_engagement_log_event_date_idx" ON "contact_engagement_log"("event_date");

-- AddForeignKey
ALTER TABLE "contact_engagement_log" ADD CONSTRAINT "contact_engagement_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_engagement_log" ADD CONSTRAINT "contact_engagement_log_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_engagement_log" ADD CONSTRAINT "contact_engagement_log_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
