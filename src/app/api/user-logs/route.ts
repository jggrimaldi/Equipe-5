import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { userLogs } from "@/db/schema";
import { nanoid } from "nanoid";

interface LogRequest {
  userId: string;
  articleId: string;
  location: Record<string, any>;
  ipAddress: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: LogRequest = await req.json();

    const { userId, articleId, location, ipAddress } = body;

    if (!userId || !articleId || !location || !ipAddress) {
      return NextResponse.json(
        { error: true, reason: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert log into database
    const log = await db.insert(userLogs).values({
      id: nanoid(),
      userId,
      articleId,
      location,
      ipAddress,
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error("Error logging user visit:", error);
    return NextResponse.json(
      { error: true, reason: "Failed to log user visit" },
      { status: 500 }
    );
  }
}
