-- CreateEnum
CREATE TYPE "ResponseFeedback" AS ENUM ('empty', 'helpful', 'not_helpful');

-- CreateTable
CREATE TABLE "AiHelpResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userPrompt" TEXT NOT NULL,
    "feedback" "ResponseFeedback" NOT NULL DEFAULT 'empty',
    "aiTextResponse" TEXT NOT NULL,
    "aiRoomidResponse" TEXT,
    "fullAiResponse" JSONB,

    CONSTRAINT "AiHelpResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiHelpResponse" ADD CONSTRAINT "AiHelpResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
