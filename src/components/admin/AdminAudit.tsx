import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { orderStatusLabels, paymentStatusLabels } from "@/data/deliveryEstimates";

type AuditRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  details: string | null;
  actor_id: string | null;
  created_at: string;
};

const actionLabels: Record<string, { label: string; color: string; icon: string }> = {
  status_change: { label: "تغيير حالة الطلب", color: "text-blue-500 bg-blue-500/10", icon: "📦" },
  payment_status_change: { label: "تغيير حالة الدفع", color: "text-green-500 bg-green-500/10", icon: "💰" },
  receipt_submitted: { label: "إرسال إثبات دفع", color: "text-primary bg-primary/10", icon: "🧾" },
  receipt_updated: { label: "تعديل إثبات دفع", color: "text-yellow-500 bg-yellow-500/10", icon: "✏️" },
};

const filters = [
  { id: "all", label: "الكل" },
  { id: "status_change", label: "حالات الطلب" },
  { id: "payment_status_change", label: "حالات الدفع" },
  { id: "receipt", label: "إثباتات الدفع" },
];

const valueLabel = (action: string, value: string | null) => {
  if (!value) return "—";
  if (action === "status_change") return orderStatusLabels[value]?.label || value;
  if (action === "payment_status_change") return paymentStatusLabels[value]?.label || value;
  return value;
};

const AdminAudit = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [actors, setActors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchLog = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("audit_log" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    const list = ((data as unknown) as AuditRow[]) || [];
    setRows(list);

    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name");
    const map: Record<string, string> = {};
    (profiles || []).forEach((p: any) => { map[p.user_id] = p.full_name || "مستخدم"; });
    setActors(map);
    setLoading(false);
  };

  useEffect(() => { fetchLog(); }, []);

  const visible = rows.filter((r) =>
    filter === "all" ? true : filter === "receipt" ? r.entity_type === "receipt" : r.action === filter
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("ar-YE", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-muted-foreground text-sm">{visible.length} إجراء مسجّل (آخر 300 عملية)</p>
        <button onClick={fetchLog} className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/70">
          <RefreshCw className="w-3.5 h-3.5" /> تحديث
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === f.id ? "gold-gradient text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right p-4 font-medium text-muted-foreground">الإجراء</th>
                <th className="text-right p-4 font-medium text-muted-foreground">الطلب</th>
                <th className="text-right p-4 font-medium text-muted-foreground">من</th>
                <th className="text-right p-4 font-medium text-muted-foreground">إلى</th>
                <th className="text-right p-4 font-medium text-muted-foreground">المنفّذ</th>
                <th className="text-right p-4 font-medium text-muted-foreground">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const info = actionLabels[r.action] || { label: r.action, color: "bg-secondary text-muted-foreground", icon: "•" };
                return (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${info.color}`}>{info.icon} {info.label}</span>
                    </td>
                    <td className="p-4 text-xs font-medium">{r.details || r.entity_id.slice(0, 8)}</td>
                    <td className="p-4 text-xs text-muted-foreground">{valueLabel(r.action, r.old_value)}</td>
                    <td className="p-4 text-xs font-bold">{valueLabel(r.action, r.new_value)}</td>
                    <td className="p-4 text-xs">{r.actor_id ? actors[r.actor_id] || "مستخدم" : "النظام"}</td>
                    <td className="p-4 text-xs text-muted-foreground">{formatDate(r.created_at)}</td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد سجلات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAudit;
