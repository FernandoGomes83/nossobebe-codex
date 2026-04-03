import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("user_id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !adminUser) {
    redirect("/admin/login?error=not_authorized");
  }

  return {
    adminUser,
    user,
  };
}
