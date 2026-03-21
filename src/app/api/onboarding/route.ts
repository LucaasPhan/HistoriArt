import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { userProfiles } from "@/drizzle/schema";
import { verifySession } from "@/dal/verifySession";

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { age, gender, purposeOfUse, customPurpose, communicationPreference } = body;

    // Basic validation
    if (age === undefined || !gender || !purposeOfUse || !communicationPreference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db.insert(userProfiles)
      .values({
        userId: session.user.id,
        age: Number(age),
        gender,
        purposeOfUse,
        customPurpose,
        communicationPreference,
        onboardingComplete: true,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          age: Number(age),
          gender,
          purposeOfUse,
          customPurpose,
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
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}
