import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();

const requiredPaths = [
  "supabase/migrations/20260403_000001_initial_foundation.sql",
  "src/app/api/webhooks/mercadopago/route.ts",
  "src/app/api/uploads/baby-photo/route.ts",
  "src/app/api/pedido/[token]/zip/route.ts",
  "src/app/admin/page.tsx",
  "src/app/criar/page.tsx",
  "src/app/blog/page.tsx",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
];

const contentChecks = [
  {
    label: "blog posts",
    dir: "src/content/blog",
    minCount: 8,
    suffix: ".mdx",
  },
];

let hasFailure = false;

process.stdout.write("Checking critical files...\n");

for (const relativePath of requiredPaths) {
  const absolutePath = path.join(cwd, relativePath);
  if (!fs.existsSync(absolutePath)) {
    hasFailure = true;
    process.stdout.write(`MISSING ${relativePath}\n`);
  } else {
    process.stdout.write(`OK ${relativePath}\n`);
  }
}

process.stdout.write("\nChecking content volume...\n");

for (const check of contentChecks) {
  const absoluteDir = path.join(cwd, check.dir);
  const count = fs.existsSync(absoluteDir)
    ? fs
        .readdirSync(absoluteDir)
        .filter((entry) => entry.endsWith(check.suffix)).length
    : 0;

  if (count < check.minCount) {
    hasFailure = true;
    process.stdout.write(
      `LOW ${check.label}: found ${count}, expected at least ${check.minCount}\n`,
    );
  } else {
    process.stdout.write(`OK ${check.label}: ${count}\n`);
  }
}

if (hasFailure) {
  process.stderr.write(
    "\nSmoke check failed. Resolve the missing structural items before deploy.\n",
  );
  process.exit(1);
}

process.stdout.write("\nSmoke check passed.\n");
