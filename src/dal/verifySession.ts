import { headers } from "next/headers";
import { cache } from "react";
import "server-only";
import { retryAuth } from "../constants/retry";
import { auth } from "@/lib/auth";

export const verifySession = cache(async () => {
  return retryAuth(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }
    return session;
  }, "Session verification");
});
