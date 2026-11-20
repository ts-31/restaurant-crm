"use server";

import { getDatabaseHealth as fetchHealth } from "./health";

export async function getDatabaseHealth() {
  return fetchHealth();
}

import { createClient } from "@/lib/supabase/server";
import { calcOrderTotals } from "@/lib/money";
import type { OrderStatus, ServicePacing } from "@/lib/types";
import { revalidatePath } from "next/cache";

export type PlaceOrderInput = {
  tableId: string;
  pacing: ServicePacing;
  chefNotes: string;
  tipRate: number;
  lines: { menuItemId: string; quantity: number; note: string }[];
};

export async function placeOrder(input: PlaceOrderInput) {
  const supabase = await createClient();

  if (!input.lines.length) {
    return { error: "Cart is empty" };
  }

  const { data: table, error: tableError } = await supabase
    .from("tables")
    .select("id, restaurant_id, label, is_active")
    .eq("id", input.tableId)
    .maybeSingle();

  if (tableError || !table || !table.is_active) {
    return { error: "Table not found or inactive" };
  }

  const ids = input.lines.map((l) => l.menuItemId);
  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("*")
    .in("id", ids)
    .eq("restaurant_id", table.restaurant_id);

  if (itemsError || !items?.length) {
    return { error: "Menu items unavailable" };
  }

  const itemMap = new Map(items.map((i) => [i.id, i]));
  for (const line of input.lines) {
    const item = itemMap.get(line.menuItemId);
    if (!item || !item.is_available || line.quantity < 1) {
      return { error: `Item unavailable: ${line.menuItemId}` };
    }
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("tax_rate")
    .eq("id", table.restaurant_id)
    .single();

  const taxRate = Number(restaurant?.tax_rate ?? 0.08);
  const tipRate = Math.max(0, input.tipRate);

  let subtotal = 0;
  const orderLines = input.lines.map((line) => {
    const item = itemMap.get(line.menuItemId)!;
    const price = Number(item.price);
    subtotal += price * line.quantity;
    return {
      menu_item_id: item.id,
      name_snapshot: item.name,
      price_snapshot: price,
      quantity: line.quantity,
      note: line.note || null,
      image_url: item.image_url,
    };
  });

  const totals = calcOrderTotals(subtotal, taxRate, tipRate);

  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", table.restaurant_id);

  const orderNumber = `#${1000 + (count ?? 0) + 1}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      restaurant_id: table.restaurant_id,
      table_id: table.id,
      order_number: orderNumber,
      status: "new",
      payment_status: "unpaid",
      payment_method: "cash",
      pacing: input.pacing,
      chef_notes: input.chefNotes || null,
      subtotal: totals.subtotal,
      tax: totals.tax,
      tip: totals.tip,
      total: totals.total,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Failed to create order" };
  }

  const { error: linesError } = await supabase.from("order_items").insert(
    orderLines.map((l) => ({ ...l, order_id: order.id }))
  );

  if (linesError) {
    return { error: linesError.message };
  }

  revalidatePath("/dashboard");
  return { orderId: order.id as string };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function toggleMenuAvailability(itemId: string, isAvailable: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function createTable(label: string, section: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("restaurant_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "No staff profile" };

  const slug =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6);

  const { data, error } = await supabase
    .from("tables")
    .insert({
      restaurant_id: profile.restaurant_id,
      label,
      section: section || null,
      qr_slug: slug,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/tables");
  return { table: data };
}

export async function updateTable(
  tableId: string,
  patch: { label?: string; section?: string | null; is_active?: boolean }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("tables").update(patch).eq("id", tableId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/tables");
  return { ok: true };
}

export async function deleteTable(tableId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tables").delete().eq("id", tableId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/tables");
  return { ok: true };
}

export async function upsertCategory(input: { id?: string; name: string; sort_order?: number }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("restaurant_id")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "No staff profile" };

  if (input.id) {
    const { error } = await supabase
      .from("categories")
      .update({ name: input.name, sort_order: input.sort_order ?? 0 })
      .eq("id", input.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("categories").insert({
      restaurant_id: profile.restaurant_id,
      name: input.name,
      sort_order: input.sort_order ?? 0,
    });
    if (error) return { error: error.message };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function upsertMenuItem(input: {
  id?: string;
  category_id: string | null;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  price: number;
  image_url?: string | null;
  badge?: string | null;
  meta?: string | null;
  is_signature?: boolean;
  is_available?: boolean;
  tags?: string[];
  sort_order?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("restaurant_id")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "No staff profile" };

  const payload = {
    restaurant_id: profile.restaurant_id,
    category_id: input.category_id,
    name: input.name,
    subtitle: input.subtitle ?? null,
    description: input.description ?? null,
    price: input.price,
    image_url: input.image_url ?? null,
    badge: input.badge ?? null,
    meta: input.meta ?? null,
    is_signature: input.is_signature ?? false,
    is_available: input.is_available ?? true,
    tags: input.tags ?? [],
    sort_order: input.sort_order ?? 0,
  };

  if (input.id) {
    const { error } = await supabase.from("menu_items").update(payload).eq("id", input.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("menu_items").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath("/dashboard/menu");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteMenuItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function updateRestaurantSettings(input: {
  name: string;
  tagline?: string | null;
  tax_rate: number;
  default_tip_rate?: number;
  currency?: string;
  logo_url?: string | null;
  accent_color?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("restaurant_id")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "No staff profile" };

  const basePayload: Record<string, unknown> = {
    name: input.name,
    tax_rate: input.tax_rate,
    default_tip_rate: input.default_tip_rate ?? 0,
    currency: input.currency ?? "EUR",
    logo_url: input.logo_url !== undefined ? input.logo_url : undefined,
    accent_color: input.accent_color !== undefined ? input.accent_color : undefined,
  };

  if (input.tagline !== undefined) {
    const { error: taglineError } = await supabase
      .from("restaurants")
      .update({ ...basePayload, tagline: input.tagline })
      .eq("id", profile.restaurant_id);

    if (!taglineError) {
      revalidatePath("/dashboard/settings");
      revalidatePath("/dashboard");
      return { ok: true };
    }
  }

  const { error } = await supabase
    .from("restaurants")
    .update(basePayload)
    .eq("id", profile.restaurant_id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function uploadMenuImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return { error: "No valid image file provided" };
  }

  // Generate safe unique filename
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("menu-images")
    .upload(filename, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from("menu-images").getPublicUrl(filename);
  return { url: data.publicUrl };
}

export async function deleteMenuImage(imageUrl: string): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/menu-images/");
    if (parts.length > 1) {
      const path = parts[1];
      const { error } = await supabase.storage.from("menu-images").remove([path]);
      if (error) return { error: error.message };
    }
    return { ok: true };
  } catch {
    return { error: "Invalid image URL" };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
