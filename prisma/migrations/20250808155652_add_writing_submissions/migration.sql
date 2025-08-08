-- CreateTable
CREATE TABLE "public"."writing_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "difficulty" "public"."DifficultyLevel" NOT NULL,
    "topic" TEXT,
    "promptText" TEXT NOT NULL,
    "userText" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "evaluation" JSONB NOT NULL,

    CONSTRAINT "writing_submissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."writing_submissions" ADD CONSTRAINT "writing_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
