-- CreateIndex
CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");

-- CreateIndex
CREATE INDEX "Todo_userId_completed_idx" ON "Todo"("userId", "completed");

-- CreateIndex
CREATE INDEX "Todo_userId_completedAt_idx" ON "Todo"("userId", "completedAt");
