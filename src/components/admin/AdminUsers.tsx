import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];
type UserWithRole = Profile & { role: AppRole; role_id: string | null };

const roleLabels: Record<string, string> = { admin: "مدير", customer: "عميل", support: "دعم فني" };
const roleColors: Record<string, string> = {
  admin: "text-primary bg-primary/10",
  customer: "text-green-400 bg-green-400/10",
  support: "text-blue-400 bg-blue-400/10",
};

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
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
    setLoading(false);
  };

  const changeRole = async (user: UserWithRole, newRole: AppRole) => {
    if (newRole === user.role) return;
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

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">{users.length} مستخدم مسجل</p>
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
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {(u.full_name?.[0] || "U").toUpperCase()}
                      </div>
                      <span className="font-medium">{u.full_name || "بدون اسم"}</span>
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
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                    {new Date(u.created_at).toLocaleDateString("ar")}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا يوجد مستخدمون بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
