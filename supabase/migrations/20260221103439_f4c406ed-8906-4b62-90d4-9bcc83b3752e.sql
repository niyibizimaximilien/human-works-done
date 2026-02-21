
-- Fix audit_logs INSERT: only allow inserting with own user_id
DROP POLICY "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix notifications INSERT: only admins or system functions should create notifications
-- For now, allow inserting notifications for any user (needed for system triggers)
DROP POLICY "System can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
