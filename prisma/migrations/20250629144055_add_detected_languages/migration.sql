-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "detectedLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[];
