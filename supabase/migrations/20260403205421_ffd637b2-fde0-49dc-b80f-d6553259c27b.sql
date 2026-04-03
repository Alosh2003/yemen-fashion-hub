
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  image TEXT,
  category TEXT NOT NULL DEFAULT '',
  subcategory TEXT NOT NULL DEFAULT '',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  badge TEXT,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can read active products
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update user roles
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed initial products
INSERT INTO public.products (name, price, original_price, image, category, subcategory, sizes, colors, badge, rating, reviews, stock) VALUES
  ('قميص كلاسيكي أزرق', 8500, 12000, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80', 'men', 'قمصان', ARRAY['S','M','L','XL'], ARRAY['أزرق','أبيض'], 'خصم 30%', 4.5, 23, 50),
  ('فستان سهرة أنيق', 25000, NULL, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80', 'women', 'فساتين', ARRAY['S','M','L'], ARRAY['أسود','أحمر'], 'جديد', 4.8, 45, 30),
  ('بدلة رجالية فاخرة', 45000, 55000, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80', 'men', 'بدلات', ARRAY['M','L','XL','XXL'], ARRAY['كحلي','رمادي'], 'الأكثر مبيعاً', 4.9, 67, 20),
  ('طقم أطفال قطني', 5500, NULL, 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80', 'kids', 'أطقم', ARRAY['2-3','4-5','6-7'], ARRAY['ملون'], NULL, 4.3, 18, 40),
  ('حذاء رياضي نايك', 15000, 18000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', 'sports', 'أحذية', ARRAY['40','41','42','43','44'], ARRAY['أحمر','أسود'], 'خصم 17%', 4.7, 89, 60),
  ('عباءة يمنية تقليدية', 18000, NULL, 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400&q=80', 'traditional', 'عبايات', ARRAY['M','L','XL'], ARRAY['أسود','بني'], 'حصري', 4.6, 34, 25),
  ('ساعة يد كلاسيكية', 22000, NULL, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80', 'accessories', 'ساعات', ARRAY['واحد'], ARRAY['ذهبي','فضي'], NULL, 4.4, 56, 35),
  ('جينز سليم فت', 9500, NULL, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80', 'men', 'بناطيل', ARRAY['30','32','34','36'], ARRAY['أزرق غامق','أسود'], NULL, 4.2, 41, 45);

-- Enable realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
