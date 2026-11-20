"use client";

import { useMemo, useState } from "react";
import type { OrderWithItems, OrderStatus } from "@/lib/types";
import { formatMoney, timeAgo } from "@/lib/utils";
import { Drawer } from "@/components/ui/Drawer";
import { updateOrderStatus } from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";

type Props = {
  initialOrders: OrderWithItems[];
  currency?: string;
};

export function OrdersHistory({ initialOrders, currency = "EUR" }: Props) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.order_number.toLowerCase().includes(search.toLowerCase()) ||
        (order.tables?.label ?? "").toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? order.status === "new" ||
              order.status === "preparing" ||
              order.status === "ready"
            : order.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const servedOrders = orders.filter((o) => o.status === "served");
    const totalRevenue = servedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const avgOrderValue = servedOrders.length > 0 ? totalRevenue / servedOrders.length : 0;

    return {
      totalOrders,
      servedCount: servedOrders.length,
      totalRevenue,
      avgOrderValue,
    };
  }, [orders]);

  async function handleStatusChange(newStatus: OrderStatus) {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      const res = await updateOrderStatus(selectedOrder.id, newStatus);
      if (res?.error) {
        toast(res.error, "error");
      } else {
        toast(`Order ${selectedOrder.order_number} marked as ${newStatus}`, "success");
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
        );
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } finally {
      setUpdating(false);
    }
  }

  const statusColors: Record<OrderStatus, string> = {
    new: "bg-primary/10 text-primary border-primary/20",
    preparing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    ready: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    served: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex flex-col gap-1 shadow-xs">
          <span className="text-xs text-on-surface-variant font-medium">Total Orders</span>
          <span className="text-2xl font-bold text-on-surface">{stats.totalOrders}</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex flex-col gap-1 shadow-xs">
          <span className="text-xs text-on-surface-variant font-medium">Completed / Served</span>
          <span className="text-2xl font-bold text-emerald-600">{stats.servedCount}</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex flex-col gap-1 shadow-xs">
          <span className="text-xs text-on-surface-variant font-medium">Delivered Revenue</span>
          <span className="text-2xl font-bold text-primary font-mono">
            {formatMoney(stats.totalRevenue, currency)}
          </span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex flex-col gap-1 shadow-xs">
          <span className="text-xs text-on-surface-variant font-medium">Avg. Ticket</span>
          <span className="text-2xl font-bold text-on-surface font-mono">
            {formatMoney(stats.avgOrderValue, currency)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by order # or table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest text-on-surface pl-10 pr-3 py-1.5 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {([
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "served", label: "Served" },
            { key: "cancelled", label: "Cancelled" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === key
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container/60 text-on-surface-variant text-xs font-semibold">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Table</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant text-sm">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const items = order.order_items || [];
                  const itemCount = items.reduce((acc, i) => acc + (i.quantity || 1), 0);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-bold text-on-surface">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4 text-on-surface">
                        <span className="px-2 py-0.5 rounded-md bg-surface-container font-semibold text-xs border border-outline-variant/30">
                          {order.tables?.label ?? "Table"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-on-surface-variant font-mono">
                        {timeAgo(order.placed_at)}
                      </td>
                      <td className="py-3 px-4 text-xs text-on-surface">
                        <span className="font-medium">{itemCount} items</span>
                        <div className="text-[11px] text-on-surface-variant truncate max-w-xs">
                          {items.map((i) => `${i.quantity}x ${i.name_snapshot}`).join(", ")}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-on-surface">
                        {formatMoney(Number(order.total), currency)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize border ${
                              statusColors[order.status as OrderStatus] || ""
                            }`}
                          >
                            {order.status}
                          </span>
                          {order.payment_method === "stripe" && order.payment_status === "paid" ? (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px]">verified</span> Paid (Stripe)
                            </span>
                          ) : (
                            <span className="text-[10px] text-on-surface-variant font-medium">
                              Pay at Table
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <Drawer
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Details: ${selectedOrder.order_number}` : ""}
        side="right"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between bg-surface-container p-3.5 rounded-xl border border-outline-variant/30">
              <div>
                <div className="text-xs text-on-surface-variant font-medium">Table</div>
                <div className="text-lg font-bold text-on-surface">
                  {selectedOrder.tables?.label ?? "Table"}{" "}
                  {selectedOrder.tables?.section ? `(${selectedOrder.tables.section})` : ""}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-on-surface-variant font-medium">Status</div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                    statusColors[selectedOrder.status as OrderStatus] || ""
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                <span className="text-on-surface-variant block">Placed</span>
                <span className="font-semibold text-on-surface">{timeAgo(selectedOrder.placed_at)}</span>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                <span className="text-on-surface-variant block">Pacing</span>
                <span className="font-semibold text-on-surface">{selectedOrder.pacing || "Together"}</span>
              </div>
            </div>

            {selectedOrder.chef_notes && (
              <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl">
                <div className="text-xs font-bold text-primary mb-1">Customer Note:</div>
                <p className="text-sm text-on-surface italic">&ldquo;{selectedOrder.chef_notes}&rdquo;</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Items ({(selectedOrder.order_items ?? []).length})
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {(selectedOrder.order_items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 bg-surface-container rounded-lg border border-outline-variant/20 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-surface-container-high flex items-center justify-center font-bold text-xs shrink-0">
                        {item.quantity}x
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-on-surface truncate">{item.name_snapshot}</span>
                        {item.note && (
                          <span className="text-[11px] text-primary italic font-medium">
                            Note: {item.note}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-on-surface shrink-0 ml-2">
                      {formatMoney(Number(item.price_snapshot) * item.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container p-3.5 rounded-xl border border-outline-variant/30 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>{formatMoney(Number(selectedOrder.subtotal), currency)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Tax</span>
                <span>{formatMoney(Number(selectedOrder.tax), currency)}</span>
              </div>
              {Number(selectedOrder.tip) > 0 && (
                <div className="flex justify-between text-secondary font-medium">
                  <span>Tip</span>
                  <span>{formatMoney(Number(selectedOrder.tip), currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-on-surface pt-1.5 border-t border-outline-variant/30">
                <span>Total</span>
                <span className="text-primary font-mono">
                  {formatMoney(Number(selectedOrder.total), currency)}
                </span>
              </div>
            </div>

            {/* Quick status update */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Change Status
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["new", "preparing", "ready", "served", "cancelled"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updating || selectedOrder.status === st}
                    onClick={() => handleStatusChange(st)}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg border capitalize transition-colors disabled:opacity-40 ${
                      selectedOrder.status === st
                        ? "bg-surface-container-highest border-primary/50 text-primary"
                        : "bg-surface-container border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
