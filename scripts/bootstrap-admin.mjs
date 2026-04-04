import { createClient } from "@supabase/supabase-js";

function readEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

async function main() {
  const email = readArg("--email");
  const password = readArg("--password");
  const fullName = readArg("--name") ?? "Admin";

  if (!email || !password) {
    throw new Error(
      "Usage: node scripts/bootstrap-admin.mjs --email admin@example.com --password strong-password --name \"Nome\"",
    );
  }

  const supabase = createClient(
    readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    readEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
    app_metadata: {
      role: "admin",
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Could not create admin user.");
  }

  const { error: adminInsertError } = await supabase.from("admin_users").upsert({
    user_id: data.user.id,
    full_name: fullName,
  });

  if (adminInsertError) {
    throw new Error(adminInsertError.message);
  }

  process.stdout.write(
    `Admin bootstrap complete.\nuser_id=${data.user.id}\nemail=${data.user.email}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
