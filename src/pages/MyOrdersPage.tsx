import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { orderStatusLabels } from "@/data/deliveryEstimates";
import { Package, Clock, MapPin, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  customer_name: string;
  city: string;
  total: number;
  estimated_delivery_days: number;
  created_at: string;
  status_updated_at: string;
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

type StatusHistoryEntry = {
  id: string;
  status: string;
  note: string;
  created_at: string;
};

const MyOrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [statusHistory, setStatusHistory] = useState<Record<string, StatusHistoryEntry[]>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchOrders();
  }, [user, authLoading]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-orders")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => prev.map((o) => o.id === payload.new.id ? { ...o, ...payload.new } as Order : o));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const toggleExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);

    if (!orderItems[orderId]) {
      const [{ data: items }, { data: history }] = await Promise.all([
        supabase.from("order_items").select("*").eq("order_id", orderId),
        supabase.from("order_status_history").select("*").eq("order_id", orderId).order("created_at", { ascending: true }),
      ]);
      setOrderItems((prev) => ({ ...prev, [orderId]: (items as OrderItem[]) || [] }));
      setStatusHistory((prev) => ({ ...prev, [orderId]: (history as StatusHistoryEntry[]) || [] }));
    }
  };

  const formatPrice = (n: number) => n.toLocaleString("ar-YE");
  const formatDate = (d: string) => new Date(d).toLocaleDateString("ar-YE", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  // Calculate delivery progress
  const getDeliveryProgress = (order: Order) => {
    const statusOrder = ["pending", "confirmed", "processing", "shipping", "delivered"];
    const idx = statusOrder.indexOf(order.status);
    if (order.status === "cancelled" || order.status === "returned") return 0;
    return Math.max(0, ((idx + 1) / statusOrder.length) * 100);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-8">طلباتي <span className="gold-text">السابقة</span></h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-6">لا توجد طلبات بعد</p>
            <Link to="/"><Button className="gold-gradient text-primary-foreground font-bold">تسوق الآن</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = orderStatusLabels[order.status] || orderStatusLabels.pending;
              const isExpanded = expandedOrder === order.id;
              const progress = getDeliveryProgress(order);

              return (
                <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Order header */}
                  <button onClick={() => toggleExpand(order.id)} className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors text-right">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl">{statusInfo.icon}</div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                      <span className="font-bold text-primary text-sm">{formatPrice(order.total)} ر.ي</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 space-y-4">
                      {/* Progress bar */}
                      {order.status !== "cancelled" && order.status !== "returned" && (
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>معلق</span><span>مؤكد</span><span>تجهيز</span><span>شحن</span><span>تم التوصيل</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full gold-gradient rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>التوصيل المتوقع: {order.estimated_delivery_days} أيام</span>
                          </div>
                        </div>
                      )}

                      {/* Delivery info */}
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-muted-foreground">{order.city} - {order.address}</p>
                        </div>
                      </div>

                      {/* Items */}
                      {orderItems[order.id] && (
                        <div className="space-y-2">
                          <p className="text-sm font-bold">المنتجات:</p>
                          {orderItems[order.id].map((item) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm bg-secondary/30 rounded-lg p-2">
                              <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded object-cover" />
                              <div className="flex-1">
                                <p className="font-medium text-xs">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">{item.size} | {item.color} | x{item.quantity}</p>
                              </div>
                              <span className="font-bold text-xs">{formatPrice(item.total_price)} ر.ي</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Status timeline */}
                      {statusHistory[order.id] && statusHistory[order.id].length > 0 && (
                        <div>
                          <p className="text-sm font-bold mb-2">سجل الحالات:</p>
                          <div className="space-y-2 pr-4 border-r-2 border-primary/20">
                            {statusHistory[order.id].map((h) => {
                              const hInfo = orderStatusLabels[h.status] || orderStatusLabels.pending;
                              return (
                                <div key={h.id} className="relative">
                                  <div className="absolute -right-[1.35rem] top-1 w-3 h-3 rounded-full bg-primary" />
                                  <div className="text-sm">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${hInfo.color}`}>{hInfo.label}</span>
                                    {h.note && <span className="text-muted-foreground mr-2 text-xs">{h.note}</span>}
                                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(h.created_at)}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyOrdersPage;
