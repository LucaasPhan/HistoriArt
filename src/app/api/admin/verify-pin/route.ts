import { verifySession } from "@/dal/verifySession";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = (await request.json()) as {
      pin?: string;
      purpose?: "edit" | "delete";
    };
    const pin = body.pin;
    const purpose = body.purpose === "delete" ? "delete" : "edit";

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "Missing PIN" }, { status: 400 });
    }

    const expectedPin =
      purpose === "delete" ? process.env.ADMIN_DELETE_PIN : process.env.ADMIN_EDIT_PIN;
    if (!expectedPin) {
      return NextResponse.json({ error: "Admin PIN not configured on server" }, { status: 500 });
    }

    const valid = pin === expectedPin;

    return NextResponse.json({ valid });
  } catch (error) {
    console.error("[POST /api/admin/verify-pin] Error:", error);
    return NextResponse.json({ error: "Failed to verify PIN" }, { status: 500 });
  }
}
