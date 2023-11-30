-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "publicVerificationToken" TEXT NOT NULL,
    "currentIPHash" TEXT NOT NULL,
    "numOfIpChanges" INTEGER NOT NULL DEFAULT 0,
    "requiresVerificaiton" BOOLEAN NOT NULL DEFAULT false,
    "expiresOn" TIMESTAMP(3) NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "alreadyUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresOn" TIMESTAMP(3) NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_sessionToken_key" ON "UserSession"("sessionToken");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
