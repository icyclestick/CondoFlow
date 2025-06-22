-- RLS Policies for visitors table

-- Users can view their own visitor requests
CREATE POLICY "Users can view own visitor requests" ON visitors
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own visitor requests
CREATE POLICY "Users can create own visitor requests" ON visitors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own visitor requests (for editing, check-in, check-out)
CREATE POLICY "Users can update own visitor requests" ON visitors
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own visitor requests (for cancellation)
CREATE POLICY "Users can delete own visitor requests" ON visitors
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all visitor requests
CREATE POLICY "Admins can view all visitor requests" ON visitors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all visitor requests (for approval, status changes)
CREATE POLICY "Admins can update all visitor requests" ON visitors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete all visitor requests
CREATE POLICY "Admins can delete all visitor requests" ON visitors
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  ); 