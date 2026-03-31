import { products } from "@/data/products";
import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminProducts = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground">{products.length} منتج</p>
      <Button className="gold-gradient text-primary-foreground font-bold hover:opacity-90">
        <Plus className="w-4 h-4 ml-2" /> إضافة منتج
      </Button>
    </div>

    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right p-4 font-medium text-muted-foreground">المنتج</th>
              <th className="text-right p-4 font-medium text-muted-foreground">الفئة</th>
              <th className="text-right p-4 font-medium text-muted-foreground">السعر</th>
              <th className="text-right p-4 font-medium text-muted-foreground">التقييم</th>
              <th className="text-right p-4 font-medium text-muted-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{p.subcategory}</td>
                <td className="p-4 font-bold text-primary">{p.price.toLocaleString()} ر.ي</td>
                <td className="p-4">{p.rating} ⭐</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-secondary rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AdminProducts;
