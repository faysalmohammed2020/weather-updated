
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getSession = async () => {
  const session = await getServerSession(authOptions);
  return session;
};
