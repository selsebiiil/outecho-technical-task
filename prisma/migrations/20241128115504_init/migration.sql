/*
  Warnings:

  - A unique constraint covering the columns `[userId,topicId,likeType]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_topicId_likeType_key" ON "Like"("userId", "topicId", "likeType");
