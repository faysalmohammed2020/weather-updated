// app/api/impersonate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { encode as encodeJwt, getToken } from "next-auth/jwt";

import { getSession } from "@/lib/getSession";
import prisma from "@/lib/prisma";
import { LogAction, LogActionType, LogModule } from "@/lib/log";
import { authOptions, authSecret } from "@/lib/auth";

const SESSION_MAX_AGE = authOptions.session?.maxAge ?? 60 * 60 * 24 * 30;

const getSessionCookieName = (request: NextRequest) => {
  const cookies = request.cookies;

  if (cookies.has("__Secure-next-auth.session-token")) {
    return "__Secure-next-auth.session-token";
  }

  if (cookies.has("next-auth.session-token")) {
    return "next-auth.session-token";
  }

  return process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
};

const buildStationPayload = (
  station?: {
    id: string;
    stationId: string;
    name: string;
  } | null,
) => {
  if (!station) return null;

  return {
    id: station.id,
    stationId: station.stationId,
    name: station.name,
  };
};

const buildUserClaims = (user: any) => ({
  id: user.id,
  sub: user.id,
  name: user.name,
  email: user.email,
  role: user.role ?? "observer",
  division: user.division,
  district: user.district,
  upazila: user.upazila,
  stationId: user.stationId,
  station: buildStationPayload(user.Station ?? user.station ?? null),
});

const ensureSecret = () =>
  authSecret || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";

const setSessionCookie = (
  response: NextResponse,
  request: NextRequest,
  value: string,
) => {
  const cookieName = getSessionCookieName(request);

  response.cookies.set(cookieName, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
};

// Start impersonation
export async function POST(request: NextRequest) {
  try {
    const secret = ensureSecret();

    if (!secret) {
      return NextResponse.json(
        { error: "Auth secret not configured on the server" },
        { status: 500 },
      );
    }

    const session = await getSession();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. User not authenticated." },
        { status: 403 },
      );
    }

    if ((session.user as any).isImpersonating) {
      return NextResponse.json(
        {
          error:
            "You are already impersonating a user. Stop impersonation first.",
        },
        { status: 400 },
      );
    }

    // Check if user has impersonation permissions
    if (
      session.user.role !== "super_admin" &&
      session.user.role !== "root_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Only super admins and root admins can impersonate users.",
        },
        { status: 403 },
      );
    }

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 },
      );
    }

    // Check if target user exists
    const targetUser = await prisma.users.findUnique({
      where: { id: targetUserId },
      include: { Station: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 },
      );
    }

    // Prevent impersonating another super admin unless actor is root_admin
    if (
      targetUser.role === "super_admin" &&
      session.user.role !== "root_admin"
    ) {
      return NextResponse.json(
        { error: "Cannot impersonate another super admin" },
        { status: 403 },
      );
    }

    // Prevent self-impersonation
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot impersonate yourself" },
        { status: 400 },
      );
    }

    const baseToken = await getToken({ req: request, secret });

    if (!baseToken) {
      return NextResponse.json(
        { error: "Unable to read the current session" },
        { status: 401 },
      );
    }

    const impersonationTokenPayload: Record<string, any> = {
      ...baseToken,
      ...buildUserClaims(targetUser),
      isImpersonating: true,
      originalUser: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        stationId: (session.user as any).stationId,
        division: (session.user as any).division,
        district: (session.user as any).district,
        upazila: (session.user as any).upazila,
        station: (session.user as any).station ?? null,
      },
    };

    const sessionToken = await encodeJwt({
      token: impersonationTokenPayload,
      secret,
      maxAge: SESSION_MAX_AGE,
    });

    // Log the impersonation action
    await LogAction({
      init: prisma,
      action: LogActionType.CREATE,
      actionText: "User Impersonation Started",
      role: session.user.role!,
      actorId: session.user.id!,
      targetId: targetUserId,
      actorEmail: session.user.email!,
      targetEmail: targetUser.email,
      module: LogModule.USER,
      details: {
        impersonatedUser: {
          id: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
          name: targetUser.name,
        },
      },
    });

    const response = NextResponse.json({
      success: true,
      message: `Successfully started impersonating ${targetUser.name || targetUser.email}`,
      impersonatedUser: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });

    setSessionCookie(response, request, sessionToken);

    return response;
  } catch (error) {
    console.error("Impersonation error:", error);
    return NextResponse.json(
      { error: "Internal server error during impersonation" },
      { status: 500 },
    );
  }
}

// Stop impersonation endpoint
export async function DELETE(request: NextRequest) {
  try {
    const secret = ensureSecret();

    if (!secret) {
      return NextResponse.json(
        { error: "Auth secret not configured on the server" },
        { status: 500 },
      );
    }

    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const originalUserFromToken = (session.user as any).originalUser;

    if (!(session.user as any).isImpersonating || !originalUserFromToken) {
      return NextResponse.json(
        { error: "No active impersonation session found" },
        { status: 400 },
      );
    }

    const baseToken = await getToken({ req: request, secret });

    if (!baseToken) {
      return NextResponse.json(
        { error: "Unable to read the current session" },
        { status: 401 },
      );
    }

    const originalUserRecord = originalUserFromToken?.id
      ? await prisma.users.findUnique({
          where: { id: originalUserFromToken.id },
          include: { Station: true },
        })
      : null;

    const restoredUser = originalUserRecord ?? originalUserFromToken;

    if (!restoredUser) {
      return NextResponse.json(
        { error: "Unable to restore the original session" },
        { status: 400 },
      );
    }

    const restoredTokenPayload: Record<string, any> = {
      ...baseToken,
      ...buildUserClaims(restoredUser),
      isImpersonating: false,
      originalUser: null,
    };

    const sessionToken = await encodeJwt({
      token: restoredTokenPayload,
      secret,
      maxAge: SESSION_MAX_AGE,
    });

    // Load both original admin and impersonated user for accurate logging
    const impersonatedUser = await prisma.users.findUnique({
      where: { id: session.user.id },
    });

    const logActor =
      originalUserRecord || originalUserFromToken || session.user;
    const logTarget = impersonatedUser || session.user;

    await LogAction({
      init: prisma,
      action: LogActionType.DELETE,
      actionText: "User Impersonation Stopped",
      role: (logActor as any).role || session.user.role!,
      actorId: (logActor as any).id || session.user.id,
      targetId: (logTarget as any).id || session.user.id,
      actorEmail: (logActor as any).email || session.user.email,
      targetEmail: (logTarget as any).email || session.user.email,
      module: LogModule.USER,
      details: {
        stoppedImpersonation: true,
        restoredUserId: (logActor as any).id || session.user.id,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Successfully stopped impersonation",
    });

    setSessionCookie(response, request, sessionToken);

    return response;
  } catch (error) {
    console.error("Stop impersonation error:", error);
    return NextResponse.json(
      { error: "Internal server error while stopping impersonation" },
      { status: 500 },
    );
  }
}
