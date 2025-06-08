ALTER TABLE "address" DROP CONSTRAINT "phone_format_check";--> statement-breakpoint
ALTER TABLE "supplier" DROP CONSTRAINT "supplier_email_format_check";--> statement-breakpoint
ALTER TABLE "supplier" DROP CONSTRAINT "phone_format_check";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "email_format_check";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "dob_valid_check";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "phone_format_check";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "password_length_check";