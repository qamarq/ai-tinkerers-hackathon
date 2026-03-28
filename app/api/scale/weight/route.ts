import { NextResponse } from "next/server";

import { db, eq } from "@/db";
import { scaleMeasurementsTable } from "@/db/schema";

export async function POST(req: Request) {
  const { id, weight } = (await req.json()) as { id: number; weight: number };

  const [updated] = await db
    .update(scaleMeasurementsTable)
    .set({ weight: String(weight), status: "done" })
    .where(eq(scaleMeasurementsTable.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: "Measurement not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ measurement: updated });
}
