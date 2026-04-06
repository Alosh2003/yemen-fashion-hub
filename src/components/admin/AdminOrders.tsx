import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { orderStatusLabels } from "@/data/deliveryEstimates";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, X, ChevronDown } from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  area: string;
  address: string;
  notes: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  estimated_delivery_days: number;
  created_at: string;
  payment_receipt_number: string | null;
  payment_receipt_image: string | null;
};

type OrderItem = {
  id: string;
  product_name: string;
  product_image: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

const statusOptions = ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled", "returned"] as const;

const AdminOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    setOrderItems((data as OrderItem[]) || []);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (!user) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus as any }).eq("id", orderId);
      if (error) throw error;

      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status: newStatus,
        note: statusNote || `تم تغيير الحالة إلى ${orderStatusLabels[newStatus]?.label}`,
        changed_by: user.id,
      } as any);

      toast({ title: "تم التحديث", description: `تم تغيير حالة الطلب إلى ${orderStatusLabels[newStatus]?.label}` });
      setStatusNote("");
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
      toast({ title: "خطأ", description: "فشل تحديث حالة الطلب", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (n: number) => n.toLocaleString("ar-YE");
  const formatDate = (d: string) => new Date(d).toLocaleDateString("ar-YE", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => ["confirmed", "processing", "shipping"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders.filter((o) => o.status === "delivered").reduce((s, o) => s + Number(o.total), 0),
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات", value: stats.total, color: "text-foreground" },
          { label: "طلبات معلقة", value: stats.pending, color: "text-yellow-500" },
          { label: "قيد المعالجة", value: stats.processing, color: "text-blue-500" },
          { label: "إيرادات التوصيل", value: `${formatPrice(stats.revenue)} ر.ي`, color: "text-green-500" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterStatus("all")} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filterStatus === "all" ? "gold-gradient text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
          الكل ({orders.length})
        </button>
        {statusOptions.map((s) => {
          const info = orderStatusLabels[s];
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filterStatus === s ? info.color.replace("/10", "/30") : "bg-secondary text-muted-foreground"}`}>
              {info.icon} {info.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right p-4 font-medium text-muted-foreground">رقم الطلب</th>
                <th className="text-right p-4 font-medium text-muted-foreground">العميل</th>
                <th className="text-right p-4 font-medium text-muted-foreground">المدينة</th>
                <th className="text-right p-4 font-medium text-muted-foreground">الإجمالي</th>
                <th className="text-right p-4 font-medium text-muted-foreground">الحالة</th>
                <th className="text-right p-4 font-medium text-muted-foreground">تغيير الحالة</th>
                <th className="text-right p-4 font-medium text-muted-foreground">التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const sInfo = orderStatusLabels[o.status] || orderStatusLabels.pending;
                return (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="p-4 font-medium text-xs">{o.order_number}</td>
                    <td className="p-4">
                      <p className="font-medium text-xs">{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                    </td>
                    <td className="p-4 text-xs">{o.city}</td>
                    <td className="p-4 font-bold text-primary text-xs">{formatPrice(Number(o.total))} ر.ي</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${sInfo.color}`}>{sInfo.icon} {sInfo.label}</span>
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          disabled={updating}
                          className="text-xs bg-secondary border border-border rounded-lg px-2 py-1.5 appearance-none pr-6 cursor-pointer"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{orderStatusLabels[s].label}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="ghost" onClick={() => viewOrder(o)}><Eye className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">لا توجد طلبات</p>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">تفاصيل الطلب {selectedOrder.order_number}</h3>
              <button onClick={() => setSelectedOrder(null)}><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">العميل:</span> <span className="font-medium">{selectedOrder.customer_name}</span></div>
              <div><span className="text-muted-foreground">الهاتف:</span> <span className="font-medium">{selectedOrder.customer_phone}</span></div>
              <div><span className="text-muted-foreground">المدينة:</span> <span className="font-medium">{selectedOrder.city}</span></div>
              <div><span className="text-muted-foreground">المنطقة:</span> <span className="font-medium">{selectedOrder.area}</span></div>
              <div className="col-span-2"><span className="text-muted-foreground">العنوان:</span> <span className="font-medium">{selectedOrder.address}</span></div>
              {selectedOrder.notes && <div className="col-span-2"><span className="text-muted-foreground">ملاحظات:</span> <span className="font-medium">{selectedOrder.notes}</span></div>}
              <div><span className="text-muted-foreground">الدفع:</span> <span className="font-medium">{selectedOrder.payment_method}</span></div>
              <div><span className="text-muted-foreground">التوصيل:</span> <span className="font-medium">{selectedOrder.estimated_delivery_days} أيام</span></div>
              {selectedOrder.payment_receipt_number && (
                <div className="col-span-2"><span className="text-muted-foreground">رقم الإشعار:</span> <span className="font-medium text-primary">{selectedOrder.payment_receipt_number}</span></div>
              )}
            </div>

            {selectedOrder.payment_receipt_image && (
              <div className="space-y-2">
                <p className="font-bold text-sm flex items-center gap-2">📋 صورة إشعار الدفع:</p>
                <img 
                  src={selectedOrder.payment_receipt_image} 
                  alt="إشعار الدفع" 
                  className="w-full max-h-64 object-contain rounded-lg border border-border cursor-pointer"
                  onClick={() => window.open(selectedOrder.payment_receipt_image!, '_blank')}
                />
              </div>
            )}

            <div className="space-y-2">
              <p className="font-bold text-sm">المنتجات:</p>
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-2 text-sm">
                  <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-xs">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">{item.size} | {item.color} | x{item.quantity}</p>
                  </div>
                  <span className="font-bold text-xs">{Number(item.total_price).toLocaleString("ar-YE")} ر.ي</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">المجموع الفرعي</span><span>{Number(selectedOrder.subtotal).toLocaleString("ar-YE")} ر.ي</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">التوصيل</span><span>{Number(selectedOrder.delivery_fee) === 0 ? "مجاني" : `${Number(selectedOrder.delivery_fee).toLocaleString("ar-YE")} ر.ي`}</span></div>
              <div className="flex justify-between font-black text-lg pt-2"><span>الإجمالي</span><span className="text-primary">{Number(selectedOrder.total).toLocaleString("ar-YE")} ر.ي</span></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">ملاحظة تغيير الحالة (اختياري):</label>
              <input
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="مثال: تم شحن الطلب عبر..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <p className="text-xs text-muted-foreground">التاريخ: {formatDate(selectedOrder.created_at)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
