import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

const MILD_WARNING_DAYS = 30;
const STRONG_WARNING_DAYS = 90;

function getDaysSince(date: Date) {
  const diffMs = Date.now() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export async function PasswordAgeWarning() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const account =
    (await prisma.accounts.findFirst({
      where: {
        userId,
        password: { not: null },
        providerId: { in: ["credential", "credentials"] },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        passwordChangedAt: true,
        createdAt: true,
      },
    })) ??
    (await prisma.accounts.findFirst({
      where: { userId, password: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: {
        passwordChangedAt: true,
        createdAt: true,
      },
    }));

  if (!account) {
    return null;
  }

  const referenceDate = account.passwordChangedAt ?? account.createdAt;
  const passwordAgeDays = getDaysSince(referenceDate);

  if (passwordAgeDays < MILD_WARNING_DAYS) {
    return null;
  }

  const isStrongWarning = passwordAgeDays >= STRONG_WARNING_DAYS;
  const title = isStrongWarning
    ? "Your password is old. Please review your account security."
    : "For better security, consider updating your password if you haven’t changed it recently.";
  const style = isStrongWarning
    ? "border-amber-300 bg-amber-50 text-amber-900"
    : "border-sky-200 bg-sky-50 text-sky-900";
  const subtext = isStrongWarning
    ? `It has been ${passwordAgeDays} days since your last password update.`
    : `It has been ${passwordAgeDays} days since your last password update.`;

  return (
    <div className={`mx-6 mt-4 rounded-lg border px-4 py-3 ${style}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm opacity-90">{subtext}</p>
    </div>
  );
}
