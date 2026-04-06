import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Wallet, Save, X } from "lucide-react";

interface WalletItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  phone_number: string | null;
  is_active: boolean;
  sort_order: number;
}

const colorOptions = [
  { label: "أزرق", value: "from-blue-500 to-blue-700" },
  { label: "أخضر", value: "from-green-500 to-green-700" },
  { label: "برتقالي", value: "from-orange-500 to-orange-700" },
  { label: "أصفر", value: "from-yellow-600 to-yellow-800" },
  { label: "بنفسجي", value: "from-purple-500 to-purple-700" },
  { label: "أحمر", value: "from-red-500 to-red-700" },
];

const AdminWallets = () => {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "💳", color: colorOptions[0].value, phone_number: "", sort_order: 0 });

  const fetchWallets = async () => {
    const { data } = await supabase
      .from("wallets")
      .select("*")
      .order("sort_order", { ascending: true });
    setWallets((data as WalletItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchWallets(); }, []);

  const resetForm = () => {
    setForm({ name: "", icon: "💳", color: colorOptions[0].value, phone_number: "", sort_order: 0 });
    setShowAdd(false);
    setEditing(null);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المحفظة", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("wallets").insert({
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
      phone_number: form.phone_number || null,
      sort_order: form.sort_order,
      is_active: true,
    } as any);
    if (error) {
      toast({ title: "خطأ", description: "فشل في إضافة المحفظة", variant: "destructive" });
    } else {
      toast({ title: "تمت الإضافة", description: "تمت إضافة المحفظة بنجاح" });
      resetForm();
      fetchWallets();
    }
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase.from("wallets").update({
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
      phone_number: form.phone_number || null,
      sort_order: form.sort_order,
    } as any).eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث المحفظة", variant: "destructive" });
    } else {
      toast({ title: "تم التحديث", description: "تم تحديث المحفظة بنجاح" });
      resetForm();
      fetchWallets();
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await supabase.from("wallets").update({ is_active: !current } as any).eq("id", id);
    fetchWallets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المحفظة؟")) return;
    await supabase.from("wallets").delete().eq("id", id);
    toast({ title: "تم الحذف", description: "تم حذف المحفظة" });
    fetchWallets();
  };

  const startEdit = (w: WalletItem) => {
    setEditing(w.id);
    setShowAdd(false);
    setForm({ name: w.name, icon: w.icon, color: w.color, phone_number: w.phone_number || "", sort_order: w.sort_order });
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> إدارة المحافظ</h3>
        <Button onClick={() => { resetForm(); setShowAdd(true); }} className="gold-gradient text-primary-foreground font-bold gap-2">
          <Plus className="w-4 h-4" /> إضافة محفظة
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAdd || editing) && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h4 className="font-bold">{editing ? "تعديل المحفظة" : "إضافة محفظة جديدة"}</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم المحفظة *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: فلوسك" className="text-right" />
            </div>
            <div className="space-y-2">
              <Label>رقم المحفظة</Label>
              <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="مثال: 7XXXXXXXX" dir="ltr" className="text-right" />
            </div>
            <div className="space-y-2">
              <Label>الأيقونة</Label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="💳" className="text-center text-2xl" />
            </div>
            <div className="space-y-2">
              <Label>الترتيب</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>اللون</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setForm({ ...form, color: c.value })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-br ${c.value} ${form.color === c.value ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-60 hover:opacity-100"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => editing ? handleUpdate(editing) : handleAdd()} className="gold-gradient text-primary-foreground font-bold gap-2">
              <Save className="w-4 h-4" /> {editing ? "حفظ التعديلات" : "إضافة"}
            </Button>
            <Button variant="outline" onClick={resetForm} className="gap-2"><X className="w-4 h-4" /> إلغاء</Button>
          </div>
        </div>
      )}

      {/* Wallets List */}
      <div className="space-y-3">
        {wallets.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد محافظ مضافة</p>
        ) : (
          wallets.map((w) => (
            <div key={w.id} className={`bg-card border border-border rounded-xl p-4 flex items-center gap-4 transition-opacity ${!w.is_active ? "opacity-50" : ""}`}>
              <span className={`text-2xl w-12 h-12 rounded-lg bg-gradient-to-br ${w.color} flex items-center justify-center shrink-0`}>{w.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold">{w.name}</p>
                {w.phone_number && <p className="text-sm text-muted-foreground" dir="ltr">{w.phone_number}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Switch checked={w.is_active} onCheckedChange={() => handleToggle(w.id, w.is_active)} />
                <Button variant="ghost" size="icon" onClick={() => startEdit(w)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminWallets;
