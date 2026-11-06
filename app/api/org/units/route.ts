import { NextRequest, NextResponse } from "next/server";
import { listJoinableUnits } from "@/lib/org/queries";

export async function GET(request: NextRequest) {
  const cityId = request.nextUrl.searchParams.get("cityId")?.trim();
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? undefined;

  if (!cityId) {
    return NextResponse.json(
      { error: "cityId is required" },
      { status: 400 },
    );
  }

  try {
    const units = await listJoinableUnits({ cityId, q });
    return NextResponse.json({ units });
  } catch {
    return NextResponse.json(
      { error: "Could not load teams" },
      { status: 500 },
    );
  }
}
