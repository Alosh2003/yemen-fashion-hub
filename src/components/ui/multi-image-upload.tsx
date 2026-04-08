import { useState, useRef } from "react";
import { Upload, X, Plus } from "lucide-react";

interface MultiImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  maxSizeMB?: number;
  maxImages?: number;
}

const MultiImageUpload = ({ value = [], onChange, label = "صور المنتج", maxSizeMB = 2, maxImages = 6 }: MultiImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | File[]) => {
    const newImages = [...value];
    Array.from(files).forEach((file) => {
      if (newImages.length >= maxImages) return;
      if (!file.type.startsWith("image/")) return;
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`حجم الصورة يجب أن يكون أقل من ${maxSizeMB} ميجابايت`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push(reader.result as string);
        onChange([...newImages]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const arr = [...value];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">{label} ({value.length}/{maxImages})</label>
      
      <div className="grid grid-cols-3 gap-2">
        {value.map((img, i) => (
          <div key={i} className="relative group aspect-square">
            <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-border" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
              <button onClick={() => removeImage(i)} className="bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
              {i > 0 && (
                <button onClick={() => moveImage(i, i - 1)} className="bg-background/80 text-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">→</button>
              )}
              {i < value.length - 1 && (
                <button onClick={() => moveImage(i, i + 1)} className="bg-background/80 text-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">←</button>
              )}
            </div>
            {i === 0 && (
              <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">رئيسية</span>
            )}
          </div>
        ))}
        
        {value.length < maxImages && (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
          >
            <Plus className="w-6 h-6 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">إضافة صورة</p>
          </div>
        )}
      </div>
      
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleChange} className="hidden" />
    </div>
  );
};

export default MultiImageUpload;
