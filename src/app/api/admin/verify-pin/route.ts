import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { pin, purpose = "edit" } = (await request.json()) as {
      pin?: string;
      purpose?: "edit" | "delete";
    };

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "Missing PIN" }, { status: 400 });
    }

    // ─── Check Lockout State ───
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (currentUser?.lockoutUntil && new Date(currentUser.lockoutUntil) > new Date()) {
      const timeLeft = Math.ceil(
        (new Date(currentUser.lockoutUntil).getTime() - Date.now()) / (1000 * 60),
      );
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${timeLeft} minutes.` },
        { status: 403 },
      );
    }

    const expectedPin =
      purpose === "delete" ? process.env.ADMIN_DELETE_PIN : process.env.ADMIN_EDIT_PIN;
    if (!expectedPin) {
      return NextResponse.json({ error: "Admin PIN not configured on server" }, { status: 500 });
    }

    const isValid = pin === expectedPin;

    if (isValid) {
      // Reset attempts on success
      await db
        .update(user)
        .set({ failedLoginAttempts: 0, lockoutUntil: null })
        .where(eq(user.id, session.user.id));
    } else {
      // Track failure
      const newAttempts = (currentUser?.failedLoginAttempts || 0) + 1;
      const lockoutUntil =
        newAttempts >= 3 ? new Date(Date.now() + 30 * 60 * 1000) : currentUser?.lockoutUntil;

      await db
        .update(user)
        .set({
          failedLoginAttempts: newAttempts,
          lockoutUntil,
        })
        .where(eq(user.id, session.user.id));

      if (newAttempts >= 3) {
        return NextResponse.json(
          { error: "Too many attempts. Account locked for 30 minutes." },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("[POST /api/admin/verify-pin] Error:", error);
    return NextResponse.json({ error: "Failed to verify PIN" }, { status: 500 });
  }
}
