-- CreateTable deal_assignments
CREATE TABLE "deal_assignments" (
    "id" SERIAL NOT NULL,
    "deal_id" INTEGER NOT NULL,
    "se_user_id" INTEGER NOT NULL,
    "assigned_by_user_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deal_assignments_deal_id_se_user_id_key" ON "deal_assignments"("deal_id", "se_user_id");

-- CreateIndex
CREATE INDEX "deal_assignments_deal_id_idx" ON "deal_assignments"("deal_id");

-- CreateIndex
CREATE INDEX "deal_assignments_se_user_id_idx" ON "deal_assignments"("se_user_id");

-- AddForeignKey
ALTER TABLE "deal_assignments" ADD CONSTRAINT "deal_assignments_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_assignments" ADD CONSTRAINT "deal_assignments_se_user_id_fkey" FOREIGN KEY ("se_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_assignments" ADD CONSTRAINT "deal_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
