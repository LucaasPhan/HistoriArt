import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { userProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      purposeOfUse,
      customPurpose,
      communicationPreference,
      firstName,
      lastName,
      age,
      gender,
      readingGoal,
      personality,
    } = body;

    const updates: Partial<Record<keyof typeof userProfiles._.columns, any>> = {
      updatedAt: new Date(),
    };
    if (purposeOfUse !== undefined) updates.purposeOfUse = purposeOfUse;
    if (customPurpose !== undefined) updates.customPurpose = customPurpose;
    if (communicationPreference !== undefined)
      updates.communicationPreference = communicationPreference;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (age !== undefined) updates.age = Number(age);
    if (gender !== undefined) updates.gender = gender;
    if (readingGoal !== undefined) updates.readingGoal = readingGoal;
    if (personality !== undefined) updates.personality = personality;

    await db.update(userProfiles).set(updates).where(eq(userProfiles.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
