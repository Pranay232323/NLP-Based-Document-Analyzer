import { pingMongo } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mongo = await pingMongo();

    // Keep health endpoint successful even if Mongo is not configured yet,
    // while clearly reporting database status for local setup diagnostics.
    return Response.json({
      ok: true,
      services: {
        mongodb: mongo,
      },
    });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
