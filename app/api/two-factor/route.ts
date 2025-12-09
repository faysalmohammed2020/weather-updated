import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authenticator } from "otplib";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Action = "enable" | "verifyTotp" | "verifyBackupCode" | "disable";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: { message } }, { status });
}

function jsonOk(data?: unknown) {
  return NextResponse.json({ data, error: null });
}

// Match the legacy scrypt format used by the existing auth flow.
function verifyBetterAuthScryptColon(plain: string, stored: string) {
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
            maxmem: 1024 * 1024 * 512, // 512MB
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

async function validatePassword(userId: string, plain: string) {
  const account = await prisma.accounts.findFirst({
    where: { userId, password: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { password: true },
  });

  if (!account?.password) return false;

  const stored = account.password;
  const isBcrypt =
    stored.startsWith("$2a$") ||
    stored.startsWith("$2b$") ||
    stored.startsWith("$2y$");

  if (isBcrypt) {
    return bcrypt.compare(plain, stored);
  }

  if (stored.includes(":") && /^[0-9a-fA-F:]+$/.test(stored)) {
    return verifyBetterAuthScryptColon(plain, stored);
  }

  return stored === plain;
}

function generateBackupCodes(count = 8) {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString("hex")
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email) {
    return jsonError("Unauthorized", 401);
  }

  const body = await req.json().catch(() => ({}));
  const action: Action | undefined = body?.action;

  if (!action) {
    return jsonError("Missing action");
  }

  const userId = session.user.id as string;
  const email = session.user.email as string;

  if (action === "enable") {
    const password = String(body?.password || "");
    if (!password) {
      return jsonError("Password is required");
    }

    const ok = await validatePassword(userId, password);
    if (!ok) {
      return jsonError("Invalid password", 401);
    }

    const secret = authenticator.generateSecret();
    const totpURI = authenticator.keyuri(email, "Weather Forecast BD", secret);
    const backupCodes = generateBackupCodes();

    const existingTwoFactor = await prisma.twoFactor.findFirst({
      where: { userId },
    });

    if (existingTwoFactor) {
      await prisma.twoFactor.update({
        where: { id: existingTwoFactor.id },
        data: { secret, backupCodes: JSON.stringify(backupCodes) },
      });
    } else {
      await prisma.twoFactor.create({
        data: { userId, secret, backupCodes: JSON.stringify(backupCodes) },
      });
    }

    // Mark as pending until verification succeeds
    await prisma.users.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    });

    return jsonOk({ totpURI, backupCodes });
  }

  if (action === "verifyTotp") {
    const code = String(body?.code || "").trim();
    if (!code) {
      return jsonError("Verification code is required");
    }

    const record = await prisma.twoFactor.findFirst({
      where: { userId },
      select: { secret: true },
    });

    if (!record?.secret) {
      return jsonError("Two-factor setup not found", 404);
    }

    const valid = authenticator.verify({ token: code, secret: record.secret });

    if (!valid) {
      return jsonError("Invalid verification code", 400);
    }

    await prisma.users.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return jsonOk({ success: true });
  }

  if (action === "verifyBackupCode") {
    const code = String(body?.code || "").trim();
    if (!code) {
      return jsonError("Backup code is required");
    }

    const record = await prisma.twoFactor.findFirst({
      where: { userId },
      select: { backupCodes: true },
    });

    const codes: string[] = record?.backupCodes
      ? JSON.parse(record.backupCodes)
      : [];

    const index = codes.findIndex((c) => c === code);
    if (index === -1) {
      return jsonError("Invalid backup code", 400);
    }

    codes.splice(index, 1);

    const existingTwoFactor = await prisma.twoFactor.findFirst({
      where: { userId },
    });

    if (existingTwoFactor) {
      await prisma.twoFactor.update({
        where: { id: existingTwoFactor.id },
        data: { backupCodes: JSON.stringify(codes) },
      });
    } else {
      await prisma.twoFactor.create({
        data: { userId, backupCodes: JSON.stringify(codes) },
      });
    }

    await prisma.users.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return jsonOk({ success: true });
  }

  if (action === "disable") {
    const password = String(body?.password || "");
    if (!password) {
      return jsonError("Password is required");
    }

    const ok = await validatePassword(userId, password);
    if (!ok) {
      return jsonError("Invalid password", 401);
    }

    await prisma.twoFactor.deleteMany({ where: { userId } });
    await prisma.users.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    });

    return jsonOk({ success: true });
  }

  return jsonError("Unsupported action");
}
