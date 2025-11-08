import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get user IP from request headers
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (ip === "unknown" || !ip) {
      return NextResponse.json(
        { error: true, reason: "Could not determine IP address" },
        { status: 400 }
      );
    }

    // Fetch geolocation data from ipapi
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return NextResponse.json(
      { error: true, reason: "Failed to fetch geolocation data" },
      { status: 500 }
    );
  }
}
