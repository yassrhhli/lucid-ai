CREATE POLICY "dreams_select_public" ON public.dreams FOR SELECT USING (is_public = true);
