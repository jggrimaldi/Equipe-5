import { seed } from "@/db/seed";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    seed()
    return NextResponse.json(
      { status: 200 }
    )
    }
