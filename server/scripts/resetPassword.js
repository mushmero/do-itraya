const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const prisma = require("../prismaClient");
const bcrypt = require("bcryptjs");

async function main() {
  const [email, newPassword] = process.argv.slice(2);

  if (!email || !newPassword) {
    console.log("\nUsage: node server/scripts/resetPassword.js <email> <newPassword>");
    console.log("Example: node server/scripts/resetPassword.js hakim_s09@hotmail.com MyNewPassword123\n");
    process.exit(1);
  }

  if (newPassword.length < 8 || newPassword.length > 72) {
    console.error("\nError: Password must be between 8 and 72 characters.\n");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email.trim(),
        mode: "insensitive",
      },
    },
  });

  if (!user) {
    console.error(`\nError: User with email "${email}" not found.\n`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  console.log(`\nSuccess: Password for ${user.username} (${user.email}) has been updated successfully!\n`);
}

main()
  .catch((err) => {
    console.error("Error resetting password:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
