import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { admin } from "@/lib/auth-client";
import prisma from "@/lib/prisma";
import { LogAction, LogActionType, LogModule } from "@/lib/log";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    // Check if user is authenticated and is super admin
    if (!session || !session.user || session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Unauthorized. Only super admins can impersonate users." },
        { status: 403 }
      );
    }

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.users.findUnique({
      where: { id: targetUserId },
      include: { Station: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Prevent impersonating another super admin
    if (targetUser.role === "super_admin") {
      return NextResponse.json(
        { error: "Cannot impersonate another super admin" },
        { status: 403 }
      );
    }

    // Prevent self-impersonation
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot impersonate yourself" },
        { status: 400 }
      );
    }

    // Create impersonation session by updating the current session
    // First, get the current session token
    const currentSession = await prisma.sessions.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!currentSession) {
      return NextResponse.json(
        { error: "Current session not found" },
        { status: 500 }
      );
    }

    // Update the session to impersonate the target user
    await prisma.sessions.update({
      where: {
        id: currentSession.id,
      },
      data: {
        userId: targetUserId,
        impersonatedBy: session.user.id,
      },
    });

    // Log the impersonation action
    await LogAction({
      init: prisma,
      action: LogActionType.CREATE,
      actionText: "User Impersonation Started",
      role: session.user.role!,
      actorId: session.user.id,
      targetId: targetUserId,
      actorEmail: session.user.email,
      targetEmail: targetUser.email,
      module: LogModule.USER,
      details: {
        impersonatedUser: {
          id: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
          name: targetUser.name
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully started impersonating ${targetUser.name || targetUser.email}`,
      impersonatedUser: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    });

  } catch (error) {
    console.error("Impersonation error:", error);
    return NextResponse.json(
      { error: "Internal server error during impersonation" },
      { status: 500 }
    );
  }
}

// Stop impersonation endpoint
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Stop impersonation by restoring the original session
    const currentSession = await prisma.sessions.findFirst({
      where: {
        userId: session.user.id,
        impersonatedBy: { not: null },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!currentSession || !currentSession.impersonatedBy) {
      return NextResponse.json(
        { error: "No active impersonation session found" },
        { status: 400 }
      );
    }

    // Restore the original user session
    await prisma.sessions.update({
      where: {
        id: currentSession.id,
      },
      data: {
        userId: currentSession.impersonatedBy,
        impersonatedBy: null,
      },
    });

    // Log the stop impersonation action
    await LogAction({
      init: prisma,
      action: LogActionType.DELETE,
      actionText: "User Impersonation Stopped",
      role: session.user.role!,
      actorId: session.user.id,
      targetId: session.user.id,
      actorEmail: session.user.email,
      targetEmail: session.user.email,
      module: LogModule.USER,
      details: {
        stoppedImpersonation: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Successfully stopped impersonation"
    });

  } catch (error) {
    console.error("Stop impersonation error:", error);
    return NextResponse.json(
      { error: "Internal server error while stopping impersonation" },
      { status: 500 }
    );
  }
}
