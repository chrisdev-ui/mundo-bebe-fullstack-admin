CREATE TYPE "public"."user_role" AS ENUM('USER', 'GUEST', 'ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE user_role;