
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '📦',
  image TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.categories (name, slug, icon, image, sort_order) VALUES
  ('رجالي', 'men', '👔', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80', 1),
  ('نسائي', 'women', '👗', 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80', 2),
  ('أطفال', 'kids', '🧒', 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80', 3),
  ('رياضي', 'sports', '🏃', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80', 4),
  ('تقليدي', 'traditional', '🕌', 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400&q=80', 5),
  ('إكسسوارات', 'accessories', '⌚', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80', 6);
