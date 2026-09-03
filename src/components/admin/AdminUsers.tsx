import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2, Lock, History } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];
type UserWithRole = Profile & { role: AppRole; role_id: string | null };

type RoleLog = {
  id: string;
  user_id: string;
  old_role: string | null;
  new_role: string | null;
  action: string;
  changed_by: string | null;
  created_at: string;
};

const roleLabels: Record<string, string> = { admin: "مدير", customer: "عميل", support: "دعم فني" };
const roleColors: Record<string, string> = {
  admin: "text-primary bg-primary/10",
  customer: "text-green-400 bg-green-400/10",
  support: "text-blue-400 bg-blue-400/10",
};
const actionLabels: Record<string, string> = { granted: "منح دور", changed: "تغيير دور", revoked: "سحب دور" };

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [logs, setLogs] = useState<RoleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");
    if (profiles && roles) {
      const merged = profiles.map((p) => {
        const userRole = roles.find((r) => r.user_id === p.user_id);
        return { ...p, role: (userRole?.role || "customer") as AppRole, role_id: userRole?.id || null };
      });
      setUsers(merged);
    }
    const { data: logData } = await supabase
      .from("role_change_log" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setLogs(((logData as unknown) as RoleLog[]) || []);
    setLoading(false);
  };

  const nameOf = (userId: string | null) =>
    userId ? users.find((u) => u.user_id === userId)?.full_name || "مستخدم" : "النظام";

  const changeRole = async (user: UserWithRole, newRole: AppRole) => {
    if (newRole === user.role) return;
    if (user.user_id === currentUser?.id) {
      toast({ title: "غير مسموح", description: "لا يمكنك تغيير دور حسابك الشخصي", variant: "destructive" });
      return;
    }
    setUpdating(user.id);
    try {
      if (user.role_id) {
        const { error } = await supabase.from("user_roles").update({ role: newRole } as any).eq("id", user.role_id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: user.user_id, role: newRole } as any);
        if (error) throw error;
      }
      toast({ title: "تم التحديث", description: `تم تغيير دور ${user.full_name || "المستخدم"} إلى ${roleLabels[newRole]}` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("ar-YE", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg p-3">
        <Lock className="w-4 h-4 text-primary flex-shrink-0" />
        حماية مفعّلة: لا يمكن لأي مدير تعديل دور حسابه الشخصي، وكل تغيير يُسجَّل تلقائياً في سجل التغييرات أدناه.
      </div>

      <p className="text-muted-foreground text-sm">{users.length} مستخدم مسجل</p>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right p-4 font-medium text-muted-foreground">المستخدم</th>
                <th className="text-right p-4 font-medium text-muted-foreground">الهاتف</th>
                <th className="text-right p-4 font-medium text-muted-foreground">المدينة</th>
                <th className="text-right p-4 font-medium text-muted-foreground">الدور</th>
                <th className="text-right p-4 font-medium text-muted-foreground">تغيير الدور</th>
                <th className="text-right p-4 font-medium text-muted-foreground">التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.user_id === currentUser?.id;
                return (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {(u.full_name?.[0] || "U").toUpperCase()}
                        </div>
                        <span className="font-medium">{u.full_name || "بدون اسم"}</span>
                        {isSelf && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">أنت</span>}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{u.phone || "-"}</td>
                    <td className="p-4 text-muted-foreground">{u.city || "-"}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 w-fit ${roleColors[u.role]}`}>
                        <Shield className="w-3 h-3" /> {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="p-4">
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> محمي</span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value as AppRole)}
                          disabled={updating === u.id}
                          className="text-xs bg-secondary border border-border rounded-lg px-2 py-1.5 cursor-pointer"
                        >
                          <option value="customer">عميل</option>
                          <option value="admin">مدير</option>
                          <option value="support">دعم فني</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString("ar")}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا يوجد مستخدمون بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* سجل تغييرات الأدوار */}
      <div className="space-y-3">
        <h3 className="font-bold flex items-center gap-2"><History className="w-4 h-4 text-primary" /> سجل تغييرات الأدوار</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right p-4 font-medium text-muted-foreground">الإجراء</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">المستخدم</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">من</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">إلى</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">بواسطة</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="p-4 text-xs font-bold">{actionLabels[l.action] || l.action}</td>
                    <td className="p-4 text-xs">{nameOf(l.user_id)}</td>
                    <td className="p-4 text-xs text-muted-foreground">{l.old_role ? roleLabels[l.old_role] : "—"}</td>
                    <td className="p-4 text-xs font-bold">{l.new_role ? roleLabels[l.new_role] : "—"}</td>
                    <td className="p-4 text-xs">{nameOf(l.changed_by)}</td>
                    <td className="p-4 text-xs text-muted-foreground">{formatDate(l.created_at)}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد تغييرات مسجلة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
