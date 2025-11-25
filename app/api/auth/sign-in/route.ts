import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import moment from "moment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, securityCode, stationId, stationName } = body;

    // 0) Validate required fields
    if (!email || !password || !role || !securityCode || !stationId || !stationName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1) Station exists & security code matches
    const station = await prisma.station.findFirst({ where: { stationId } });
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }
    if (station.securityCode !== securityCode) {
      return NextResponse.json({ error: "Invalid security code" }, { status: 401 });
    }

    // 2) User exists with email + role
    const user = await prisma.users.findFirst({
      where: { email, role },
      select: { id: true, email: true, role: true, Station: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found or does not have the requested role" },
        { status: 404 }
      );
    }

    // 3) User associated with station
    if (!user.Station || user.Station.stationId !== stationId) {
      return NextResponse.json(
        { error: "User is not associated with this station" },
        { status: 403 }
      );
    }

    // 4) Prevent multiple active sessions
    const existingSession = await prisma.sessions.findFirst({
      where: { userId: user.id },
      orderBy: {
        // schema-তে expiresAt থাকলে এটা কাজ করবে
        // @ts-ignore
        expiresAt: "desc",
      },
    }).catch(() =>
      prisma.sessions.findFirst({
        where: { userId: user.id },
        orderBy: {
          // schema-তে expires থাকলে এটা কাজ করবে
          // @ts-ignore
          expires: "desc",
        },
      })
    );

    if (existingSession) {
      const exp =
        // @ts-ignore
        existingSession.expiresAt ??
        // @ts-ignore
        existingSession.expires;

      if (exp && !moment(exp).isBefore()) {
        return NextResponse.json(
          { error: "You are already logged in from another device" },
          { status: 403 }
        );
      }
    }

    // 5) ✅ NextAuth Credentials callback hit (v4/v5 safe)
    const callbackUrl = new URL("/api/auth/callback/credentials", request.url);

    const res = await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email,
        password,
        redirect: "false",
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("SIGNIN_ROUTE_ERROR:", e);
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 }
    );
  }
}
