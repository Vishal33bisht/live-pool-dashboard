ALTER TABLE "Response" ADD COLUMN "anonymousFingerprint" TEXT;

CREATE UNIQUE INDEX "Response_pollId_anonymousFingerprint_key" ON "Response"("pollId", "anonymousFingerprint");
CREATE INDEX "Response_anonymousFingerprint_idx" ON "Response"("anonymousFingerprint");
