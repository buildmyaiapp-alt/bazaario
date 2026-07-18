import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { adminAuth } from "@/lib/firebase-admin";

const schema = z.object({ idToken: z.string().min(1) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing sign-in token" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(parsed.data.idToken);
    await createSession(parsed.data.idToken);
    return NextResponse.json({
      id: decoded.uid,
      name: (decoded.name as string) ?? decoded.email ?? "",
      email: decoded.email ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Could not verify sign-in. Please try again." }, { status: 401 });
  }
}
