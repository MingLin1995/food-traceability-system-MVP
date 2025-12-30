-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "production_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "test_result" TEXT NOT NULL,
    "test_details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_batch_number_key" ON "ingredients"("batch_number");
