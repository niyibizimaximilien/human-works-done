-- Add student ID number to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_id_number text;

-- Add payment workflow columns to assignments
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'none';
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS payment_proof_url text;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS admin_released boolean NOT NULL DEFAULT false;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS transferred_from uuid;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS transfer_reason text;

-- Make assignment-files bucket public so avatars can be displayed
UPDATE storage.buckets SET public = true WHERE id = 'assignment-files';

-- Add storage policy for public read on assignment-files
CREATE POLICY "Public read access for assignment-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'assignment-files');

-- Add storage policy for authenticated uploads to assignment-files  
CREATE POLICY "Authenticated users can upload to assignment-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assignment-files');

-- Add storage policy for deliverables bucket - authenticated upload
CREATE POLICY "Authenticated users can upload deliverables"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deliverables');

-- Add storage policy for deliverables - users can read their own or admin
CREATE POLICY "Users can read deliverables for their assignments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deliverables' AND (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.deliverable_url = name
      AND (a.student_id = auth.uid() OR a.agent_id = auth.uid())
      AND (a.admin_released = true OR a.agent_id = auth.uid())
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- Enable realtime for assignments
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;