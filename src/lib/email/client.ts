import { Resend } from "resend";

import { getServerEnv } from "@/lib/env";

export function createResendClient() {
  const env = getServerEnv();
  return new Resend(env.resendApiKey);
}
