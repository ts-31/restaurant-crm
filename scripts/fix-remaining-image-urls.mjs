import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webappDir = path.resolve(__dirname, "..");

const envContent = fs.readFileSync(path.join(webappDir, ".env"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) env[m[1]] = (m[2] || "").trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const BASE = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-images/dishes`;

// Fix the items that had 0 updated rows — fetch all items and update by partial name match
async function main() {
  const { data: items, error } = await supabase
    .from("menu_items")
    .select("id, name, image_url")
    .like("image_url", "/images/dishes/%");

  if (error) { console.error(error); process.exit(1); }
  console.log(`Found ${items.length} items still using local paths:`, items.map(i => i.name));

  for (const item of items) {
    // Extract filename from existing local path: /images/dishes/duck_breast.jpg
    const filename = item.image_url.split("/").pop();
    const newUrl = `${BASE}/${filename}`;
    const { error: ue } = await supabase
      .from("menu_items")
      .update({ image_url: newUrl })
      .eq("id", item.id);
    if (ue) {
      console.error(`Failed to update ${item.name}:`, ue);
    } else {
      console.log(`Updated "${item.name}" -> ${newUrl}`);
    }
  }
  console.log("Done.");
}

main();
