"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  deleteCategory,
  deleteMenuItem,
  toggleMenuAvailability,
  upsertCategory,
  upsertMenuItem,
  uploadMenuImage,
} from "@/lib/actions";
import type { Category, MenuItem } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { Drawer } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

type Props = {
  categories: Category[];
  items: MenuItem[];
  currency?: string;
};

const emptyItem = {
  name: "",
  price: 0,
  category_id: null as string | null,
  description: "",
  subtitle: "",
  image_url: "",
  badge: "",
  meta: "",
  is_signature: false,
  is_available: true,
  tags: "",
};

export function MenuManager({
  categories: initialCategories,
  items: initialItems,
  currency = "EUR",
}: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [catName, setCatName] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "item" | "category";
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        selectedCategory === "all" ? true : item.category_id === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description ?? "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, search]);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      const res = await upsertCategory({ name: catName.trim() });
      if (res?.error) {
        toast(res.error, "error");
      } else {
        toast(`Category "${catName.trim()}" added`, "success");
        setCategories((prev) => [
          ...prev,
          {
            id: "cat-" + Date.now(),
            restaurant_id: "",
            name: catName.trim(),
            sort_order: prev.length,
          },
        ]);
        setCatName("");
        setIsAddingCat(false);
      }
    } catch {
      toast("Failed to add category", "error");
    }
  }

  function startCreateItem() {
    setEditingId(null);
    setForm({
      ...emptyItem,
      category_id: selectedCategory !== "all" ? selectedCategory : categories[0]?.id || null,
    });
    setDrawerOpen(true);
  }

  function startEditItem(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: Number(item.price),
      category_id: item.category_id,
      description: item.description ?? "",
      subtitle: item.subtitle ?? "",
      image_url: item.image_url ?? "",
      badge: item.badge ?? "",
      meta: item.meta ?? "",
      is_signature: item.is_signature,
      is_available: item.is_available,
      tags: (item.tags ?? []).join(", "),
    });
    setDrawerOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMenuImage(fd);
      if (res.error) {
        toast(res.error, "error");
      } else if (res.url) {
        setForm((prev) => ({ ...prev, image_url: res.url! }));
        toast("Image uploaded successfully", "success");
      }
    } catch {
      toast("Error uploading image", "error");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        id: editingId ?? undefined,
        name: form.name.trim(),
        price: Number(form.price),
        category_id: form.category_id,
        description: form.description.trim() || null,
        subtitle: form.subtitle.trim() || null,
        image_url: form.image_url.trim() || null,
        badge: form.badge.trim() || null,
        meta: form.meta.trim() || null,
        is_signature: form.is_signature,
        is_available: form.is_available,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await upsertMenuItem(payload);
      if (res?.error) {
        toast(res.error, "error");
      } else {
        toast(editingId ? "Dish updated" : "New dish created", "success");
        if (editingId) {
          setItems((prev) =>
            prev.map((i) => (i.id === editingId ? { ...i, ...payload, id: editingId } : i))
          );
        } else {
          setItems((prev) => [
            {
              ...payload,
              id: "item-" + Date.now(),
              restaurant_id: "",
              sort_order: 0,
            } as MenuItem,
            ...prev,
          ]);
        }
        setDrawerOpen(false);
      }
    } catch {
      toast("Failed to save item", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      if (deleteTarget.type === "item") {
        const res = await deleteMenuItem(deleteTarget.id);
        if (res?.error) {
          toast(res.error, "error");
        } else {
          setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
          toast("Item removed from menu", "info");
        }
      } else {
        const res = await deleteCategory(deleteTarget.id);
        if (res?.error) {
          toast(res.error, "error");
        } else {
          setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
          if (selectedCategory === deleteTarget.id) setSelectedCategory("all");
          toast("Category removed", "info");
        }
      }
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleStock(item: MenuItem) {
    const next = !item.is_available;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: next } : i)));
    const res = await toggleMenuAvailability(item.id, next);
    if (res?.error) {
      toast(res.error, "error");
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: !next } : i)));
    } else {
      toast(`${item.name} is now ${next ? "in stock" : "86'd (hidden)"}`, next ? "success" : "info");
    }
  }

  return (
    <div className="flex flex-col gap-space-lg max-w-6xl">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Menu Management</h1>
          <p className="text-sm text-on-surface-variant">
            Manage your digital menu categories, dishes, prices, photos, and stock status.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreateItem}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-xs hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Dish</span>
        </button>
      </div>

      {/* Categories Bar */}
      <div className="flex flex-col gap-2 bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Categories ({categories.length})
          </span>
          {!isAddingCat ? (
            <button
              type="button"
              onClick={() => setIsAddingCat(true)}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add Category
            </button>
          ) : (
            <form onSubmit={handleAddCategory} className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Category name..."
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-outline-variant/40 text-xs focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-semibold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCat(false);
                  setCatName("");
                }}
                className="text-xs text-on-surface-variant hover:text-on-surface"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((c) => {
            const count = items.filter((i) => i.category_id === c.id).length;
            const active = selectedCategory === c.id;
            return (
              <div
                key={c.id}
                className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                  active
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-on-surface"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className="focus:outline-none"
                >
                  {c.name} ({count})
                </button>
                <button
                  type="button"
                  title={`Delete ${c.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ type: "category", id: c.id, name: c.name });
                  }}
                  className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${
                    active ? "text-white/80 hover:text-white" : "text-on-surface-variant/70 hover:text-error"
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
          search
        </span>
        <input
          type="text"
          placeholder="Search menu dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-container-low text-on-surface pl-10 pr-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50 shadow-xs"
        />
      </div>

      {/* Menu Items Card Grid — 3-column luxury layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredItems.length === 0 ? (
          <div className="col-span-3 bg-surface-container-low rounded-2xl p-12 text-center text-on-surface-variant text-sm border border-outline-variant/30">
            No dishes found in this category.
          </div>
        ) : (
          filteredItems.map((item) => {
            const cat = categories.find((c) => c.id === item.category_id);
            return (
              <div
                key={item.id}
                className={`group flex flex-col rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-primary/30 ${
                  !item.is_available
                    ? "opacity-60 border-outline-variant/20 bg-surface-container"
                    : "border-outline-variant/30 bg-surface-container-low"
                }`}
              >
                {/* Hero Image */}
                <div className="relative w-full h-44 bg-surface-container overflow-hidden shrink-0">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
                      <span className="material-symbols-outlined text-[56px]">restaurant</span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Top-left badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold shadow-sm backdrop-blur-sm">
                        {item.badge}
                      </span>
                    )}
                    {item.is_signature && item.badge?.toLowerCase() !== "signature" && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold shadow-sm">
                        ✦ Signature
                      </span>
                    )}
                  </div>

                  {/* Top-right stock badge */}
                  <div className="absolute top-2.5 right-2.5">
                    {item.is_available ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-[10px] font-bold backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                        In Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                        86&apos;d
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-col gap-2.5 p-4 flex-1">
                  {/* Category label */}
                  {cat && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                      {cat.name}
                    </span>
                  )}

                  {/* Dish name */}
                  <h3
                    className={`font-semibold text-base leading-snug text-on-surface ${
                      !item.is_available ? "line-through text-on-surface-variant" : ""
                    }`}
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {item.name}
                  </h3>

                  {/* Subtitle */}
                  {item.subtitle && (
                    <p className="text-[11px] text-on-surface-variant/70 italic -mt-1">{item.subtitle}</p>
                  )}

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed flex-1">
                      {item.description}
                    </p>
                  )}

                  {/* Price + Actions */}
                  <div className="flex items-center justify-between pt-2 mt-auto border-t border-outline-variant/20">
                    <span className="font-bold text-base text-primary font-mono">
                      {formatMoney(Number(item.price), currency)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(item)}
                        title={item.is_available ? "Mark as 86'd (out of stock)" : "Restock item"}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          item.is_available
                            ? "bg-surface-container text-on-surface-variant hover:text-error hover:bg-error/10"
                            : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {item.is_available ? "do_not_disturb_on" : "check_circle"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditItem(item)}
                        title="Edit dish"
                        className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({ type: "item", id: item.id, name: item.name })
                        }
                        title="Delete item"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Item Drawer Form */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? `Edit Dish: ${form.name}` : "New Menu Item"}
        side="right"
      >
        <form onSubmit={handleSaveItem} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-on-surface block mb-1">Dish Name *</label>
            <input
              required
              type="text"
              placeholder="e.g. Truffle Pappardelle"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Price ({currency}) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="14.50"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">Category</label>
              <select
                value={form.category_id ?? ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
                className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo upload section */}
          <div>
            <label className="text-xs font-semibold text-on-surface block mb-1">Dish Photo</label>
            <div className="flex items-center gap-3">
              {form.image_url ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/40 shrink-0">
                  <Image
                    src={form.image_url}
                    alt="Preview"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-1.5 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="menu-photo-file"
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors text-left flex items-center justify-between disabled:opacity-50"
                >
                  <span>{uploadingImage ? "Uploading to Storage..." : "Upload Photo from Device"}</span>
                  <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface block mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Fresh handmade pasta, shaved black truffle, aged parmigiano..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">Subtitle</label>
              <input
                type="text"
                placeholder="e.g. Vegetarian"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Badge (e.g. Popular)
              </label>
              <input
                type="text"
                placeholder="e.g. Chef Choice"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Meta Info
              </label>
              <input
                type="text"
                placeholder="e.g. 15 min bake"
                value={form.meta}
                onChange={(e) => setForm({ ...form, meta: e.target.value })}
                className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="Spicy, Gluten-Free"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 py-2 border-y border-outline-variant/20">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_signature}
                onChange={(e) => setForm({ ...form, is_signature: e.target.checked })}
                className="rounded text-primary focus:ring-0"
              />
              <span>Chef&apos;s Signature</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                className="rounded text-primary focus:ring-0"
              />
              <span>In Stock (Available)</span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving || uploadingImage}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-xs hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {isSaving ? "Saving..." : editingId ? "Update Dish" : "Create Dish"}
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="py-2.5 px-4 rounded-xl bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Drawer>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === "category" ? "Category" : "Menu Item"}`}
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
