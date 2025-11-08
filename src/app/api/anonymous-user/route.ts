import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { anonymousUsers } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Check if user already has a nanoid in cookie
    const existingNanoid = req.cookies.get("user_id")?.value;

    if (existingNanoid) {
      // Verify it exists in database
      const user = await db
        .select()
        .from(anonymousUsers)
        .where(eq(anonymousUsers.nanoid, existingNanoid))
        .limit(1);

      if (user.length > 0) {
        return NextResponse.json({
          success: true,
          nanoid: existingNanoid,
          isNew: false,
        });
      }
    }

    // Create new nanoid
    const newNanoid = nanoid();

    // Insert into database
    await db.insert(anonymousUsers).values({
      id: nanoid(),
      nanoid: newNanoid,
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      nanoid: newNanoid,
      isNew: true,
    });

    response.cookies.set("user_id", newNanoid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error creating/getting anonymous user:", error);
    return NextResponse.json(
      { error: true, reason: "Failed to create/get user" },
      { status: 500 }
    );
  }
}
