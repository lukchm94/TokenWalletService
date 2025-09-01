/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey,clientTransactionDate,amount]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Transaction_idempotencyKey_key";

-- CreateIndex
CREATE INDEX "idempotency_lookup" ON "public"."Transaction"("idempotencyKey", "clientTransactionDate", "amount");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_idempotencyKey_clientTransactionDate_amount_key" ON "public"."Transaction"("idempotencyKey", "clientTransactionDate", "amount");
