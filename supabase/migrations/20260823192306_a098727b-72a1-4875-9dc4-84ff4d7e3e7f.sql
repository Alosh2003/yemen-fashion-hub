ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS currency_old_label text NOT NULL DEFAULT 'ريال قديم',
  ADD COLUMN IF NOT EXISTS currency_new_label text NOT NULL DEFAULT 'ريال جديد',
  ADD COLUMN IF NOT EXISTS currency_rate numeric NOT NULL DEFAULT 250,
  ADD COLUMN IF NOT EXISTS show_dual_currency boolean NOT NULL DEFAULT true;