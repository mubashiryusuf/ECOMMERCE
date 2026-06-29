-- Remove FK constraints that reference the User table
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_userId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- Drop the User table (users are now stored in MongoDB)
DROP TABLE "User";

-- Drop the Role enum (was only used by User model)
DROP TYPE "Role";
