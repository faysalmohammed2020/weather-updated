// scripts/reset-password.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "zisan@gmail.com";
  const newPassword = "zisan2000";

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const hash = await bcrypt.hash(newPassword, 10);

  const acc = await prisma.accounts.findFirst({
    where: { userId: user.id, password: { not: null } },
    orderBy: { updatedAt: "desc" },
  });

  if (!acc) throw new Error("Account row not found");

  await prisma.accounts.update({
    where: { id: acc.id },
    data: {
      password: hash,
      providerId: "credentials",
      updatedAt: new Date(),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
