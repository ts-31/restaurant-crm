import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webappDir = path.resolve(__dirname, "..");

// Read .env file manually
const envPath = path.join(webappDir, ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Mapping of dish filenames to item names in DB
const DISH_MAPPINGS = [
  { file: "beef_carpaccio.jpg", name: "Beef Carpaccio" },
  { file: "burrata_pugliese.jpg", name: "Burrata Pugliese" },
  { file: "french_onion_soup.jpg", name: "French Onion Soup" },
  { file: "cote_de_boeuf.jpg", name: "Côte de Bœuf" },
  { file: "duck_breast.jpg", name: "Pan-Seared Duck Breast" },
  { file: "sea_bass.jpg", name: "Mediterranean Sea Bass" },
  { file: "lamb_rack.jpg", name: "Herb-Crusted Lamb Rack" },
  { file: "truffle_tagliatelle.jpg", name: "Black Truffle Tagliatelle" },
  { file: "lobster_risotto.jpg", name: "Lobster & Saffron Risotto" },
  { file: "creme_brulee.jpg", name: "Tahitian Vanilla Crème Brûlée" },
];

async function main() {
  console.log("Starting Supabase Storage migration for dish images...");

  // 1. Ensure bucket exists and is public
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.error("Error listing buckets:", bError);
    process.exit(1);
  }

  let menuBucket = buckets.find((b) => b.id === "menu-images" || b.name === "menu-images");
  if (!menuBucket) {
    console.log("Bucket 'menu-images' does not exist. Creating...");
    const { error: cError } = await supabase.storage.createBucket("menu-images", {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
    });
    if (cError) {
      console.error("Failed to create bucket:", cError);
      process.exit(1);
    }
    console.log("Created bucket 'menu-images' (public).");
  } else {
    console.log("Bucket 'menu-images' already exists.");
  }

  const dishesDir = path.join(webappDir, "public", "images", "dishes");

  // 2. Upload each dish to Supabase Storage
  for (const item of DISH_MAPPINGS) {
    const filePath = path.join(dishesDir, item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `dishes/${item.file}`;

    console.log(`Uploading ${item.file} to menu-images/${storagePath}...`);
    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(storagePath, fileBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error(`Error uploading ${item.file}:`, uploadError);
      continue;
    }

    const { data: urlData } = supabase.storage.from("menu-images").getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;
    console.log(`  -> CDN URL: ${publicUrl}`);

    // 3. Update the menu_items row in database
    const { data: updated, error: dbError } = await supabase
      .from("menu_items")
      .update({ image_url: publicUrl })
      .ilike("name", `%${item.name.replace(/[^a-zA-Z0-9 ]/g, "")}%`)
      .select("id, name, image_url");

    if (dbError) {
      console.error(`Error updating DB for ${item.name}:`, dbError);
    } else {
      console.log(`  -> Updated DB for:`, updated?.map((u) => u.name));
    }
  }

  console.log("\nSupabase Storage migration completed successfully!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
