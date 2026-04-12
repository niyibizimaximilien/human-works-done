
-- Storage RLS for deliverables bucket
CREATE POLICY "Agents can upload deliverables"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'deliverables'
  AND EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.id::text = (storage.foldername(name))[1]
    AND a.agent_id = auth.uid()
  )
);

CREATE POLICY "Agents can view own deliverables"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'deliverables'
  AND EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.id::text = (storage.foldername(name))[1]
    AND a.agent_id = auth.uid()
  )
);

CREATE POLICY "Students can download released deliverables"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'deliverables'
  AND EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.id::text = (storage.foldername(name))[1]
    AND a.student_id = auth.uid()
    AND a.admin_released = true
  )
);

CREATE POLICY "Admins can access all deliverables"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'deliverables'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can upload deliverables"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'deliverables'
  AND public.has_role(auth.uid(), 'admin')
);

-- Agents can view profiles of students assigned to them
CREATE POLICY "Agents can view assigned student profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.agent_id = auth.uid()
    AND a.student_id = profiles.user_id
  )
);
