
-- Add ban columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason text;

-- Allow admins to update any profile (for nickname changes, banning, etc.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Admins can update any profile"
      ON public.profiles FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Allow admins to manage roles (update and delete)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update roles' AND tablename = 'user_roles') THEN
    CREATE POLICY "Admins can update roles"
      ON public.user_roles FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete roles' AND tablename = 'user_roles') THEN
    CREATE POLICY "Admins can delete roles"
      ON public.user_roles FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert roles' AND tablename = 'user_roles') THEN
    CREATE POLICY "Admins can insert roles"
      ON public.user_roles FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Allow admins to view all messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all messages' AND tablename = 'messages') THEN
    CREATE POLICY "Admins can view all messages"
      ON public.messages FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Allow admins to create assignments (on behalf of students)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can create assignments' AND tablename = 'assignments') THEN
    CREATE POLICY "Admins can create assignments"
      ON public.assignments FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Allow admins to create notifications for anyone
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "Admins can delete notifications"
      ON public.notifications FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
