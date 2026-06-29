-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'FOLLOWERS', 'PRIVATE');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC';
