import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { userProfiles } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      age,
      gender,
      purposeOfUse,
      customPurpose,
      communicationPreference,
      readingGoal,
      personality,
    } = body;

    // Basic validation
    if (
      !firstName ||
      !lastName ||
      age === undefined ||
      !gender ||
      !purposeOfUse ||
      !communicationPreference ||
      readingGoal === undefined ||
      personality === undefined
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const purposeString = Array.isArray(purposeOfUse) ? purposeOfUse.join(", ") : purposeOfUse;
    const readingGoalString = Array.isArray(readingGoal) ? readingGoal.join(", ") : readingGoal;

    await db
      .insert(userProfiles)
      .values({
        userId: session.user.id,
        firstName,
        lastName,
        age: Number(age),
        gender,
        purposeOfUse: purposeString,
        customPurpose,
        readingGoal: readingGoalString,
        personality,
        communicationPreference,
        onboardingComplete: true,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          firstName,
          lastName,
          age: Number(age),
          gender,
          purposeOfUse: purposeString,
          customPurpose,
          readingGoal: readingGoalString,
          personality,
          communicationPreference,
          onboardingComplete: true,
          updatedAt: new Date(),
        },
      });

    // Ensure both the onboarding UI and any gated layouts/pages re-render.
    revalidatePath("/onboarding");
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json({ error: "Failed to save onboarding data" }, { status: 500 });
  }
}
