import { useState, useRef } from "react";
import { Upload, X, Image } from "lucide-react";

interface ImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  maxSizeMB?: number;
}

const ImageUpload = ({ value, onChange, label = "صورة", maxSizeMB = 2 }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`حجم الصورة يجب أن يكون أقل من ${maxSizeMB} ميجابايت`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">{label}</label>
      {value ? (
        <div className="relative group">
          <img src={value} alt={label} className="w-full h-40 object-contain rounded-xl border border-border bg-secondary/30" />
          <button
            onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
            className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-background/80 backdrop-blur text-foreground text-xs px-3 py-1.5 rounded-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity"
          >
            تغيير الصورة
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
          }`}
        >
          <Upload className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">اضغط أو اسحب الصورة هنا</p>
          <p className="text-xs text-muted-foreground/60">الحد الأقصى {maxSizeMB} ميجابايت</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </div>
  );
};

export default ImageUpload;
