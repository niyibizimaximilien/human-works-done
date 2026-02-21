-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all user roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all assignments
CREATE POLICY "Admins can view all assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete assignments
CREATE POLICY "Admins can delete assignments"
ON public.assignments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update any assignment
CREATE POLICY "Admins can update any assignment"
ON public.assignments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));