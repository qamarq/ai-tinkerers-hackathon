import { NextResponse } from "next/server";

import { db, desc, eq } from "@/db";
import { scaleMeasurementsTable } from "@/db/schema";

export async function GET() {
  const pending = await db
    .select()
    .from(scaleMeasurementsTable)
    .where(eq(scaleMeasurementsTable.status, "pending"))
    .orderBy(desc(scaleMeasurementsTable.createdAt))
    .limit(1);

  return NextResponse.json({
    shouldWeigh: pending.length > 0,
    measurement: pending[0] ?? null,
  });
}

export async function POST() {
  const [measurement] = await db
    .insert(scaleMeasurementsTable)
    .values({ status: "pending" })
    .returning();

  return NextResponse.json({ measurement });
}
