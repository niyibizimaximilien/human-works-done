
CREATE POLICY "Authenticated users can view agent profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = profiles.user_id AND role = 'agent'
    )
  );
