import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Prisma, PrismaClient } from "@prisma/client";

export const PASSWORD_HISTORY_LIMIT = 4;
export const PASSWORD_REUSE_ERROR =
  "You cannot reuse any of your last 4 passwords. Please choose a different password.";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

function verifyLegacyScryptPassword(plain: string, stored: string) {
  if (!stored.includes(":")) return false;

  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");
  const rCandidates = [8, 16];
  const pCandidates = [1, 2];

  for (let ln = 10; ln <= 18; ln++) {
    const N = 2 ** ln;

    for (const r of rCandidates) {
      for (const p of pCandidates) {
        try {
          const derived = crypto.scryptSync(plain, salt, expected.length, {
            N,
            r,
            p,
            maxmem: 1024 * 1024 * 512,
          });

          if (crypto.timingSafeEqual(derived, expected)) {
            return true;
          }
        } catch {
          continue;
        }
      }
    }
  }

  return false;
}

export async function verifyStoredPassword(plain: string, stored: string) {
  if (
    stored.startsWith("$2a$") ||
    stored.startsWith("$2b$") ||
    stored.startsWith("$2y$")
  ) {
    return bcrypt.compare(plain, stored);
  }

  if (stored.includes(":") && /^[0-9a-fA-F:]+$/.test(stored)) {
    return verifyLegacyScryptPassword(plain, stored);
  }

  return plain === stored;
}

export async function findLatestPasswordAccount(db: PrismaLike, userId: string) {
  return (
    (await db.accounts.findFirst({
      where: {
        userId,
        password: { not: null },
        providerId: { in: ["credential", "credentials"] },
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true, password: true, providerId: true },
    })) ??
    (await db.accounts.findFirst({
      where: { userId, password: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, password: true, providerId: true },
    }))
  );
}

export async function hasRecentPasswordReuse(
  db: PrismaLike,
  userId: string,
  candidatePassword: string,
  currentPasswordHash?: string | null
) {
  const currentHash =
    currentPasswordHash ??
    (await findLatestPasswordAccount(db, userId))?.password ??
    null;

  if (currentHash && (await verifyStoredPassword(candidatePassword, currentHash))) {
    return true;
  }

  const history = await db.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: PASSWORD_HISTORY_LIMIT,
    select: { passwordHash: true },
  });

  for (const entry of history) {
    if (await verifyStoredPassword(candidatePassword, entry.passwordHash)) {
      return true;
    }
  }

  return false;
}

export async function appendPasswordHistory(
  db: PrismaLike,
  userId: string,
  passwordHash: string
) {
  await db.passwordHistory.create({
    data: {
      userId,
      passwordHash,
    },
  });

  const overflowEntries = await db.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: PASSWORD_HISTORY_LIMIT,
    select: { id: true },
  });

  if (overflowEntries.length > 0) {
    await db.passwordHistory.deleteMany({
      where: { id: { in: overflowEntries.map((entry) => entry.id) } },
    });
  }
}
