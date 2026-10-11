import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";

const COOKIE_NAME = "cleardesk_browser_id";
const browserIdSchema = z.string().uuid();

export async function getProjectOwnerId() {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(COOKIE_NAME)?.value;
  if (existingId && browserIdSchema.safeParse(existingId).success) {
    return existingId;
  }

  const browserId = randomUUID();
  cookieStore.set(COOKIE_NAME, browserId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return browserId;
}
