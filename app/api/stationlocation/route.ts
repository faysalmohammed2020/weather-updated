import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stations = await prisma.station.findMany({
      orderBy: { name: "asc" }, // ← আপনার নামের ফিল্ড যদি 'name' না হয়, সেটি দিন
    });

    return NextResponse.json(stations);
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}
