CREATE TABLE public.contact_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 locale text NOT NULL CHECK (locale IN ('en', 'vi')),
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
 email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
 company text NOT NULL DEFAULT '' CHECK (char_length(company) <= 160),
 message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000)
);
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can submit contact messages" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read contact messages" ON public.contact_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));