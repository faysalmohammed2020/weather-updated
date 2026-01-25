
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const getSession = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return session;
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { banned: true },
  });

  if (!user || user.banned) {
    return null;
  }

  return session;
};
