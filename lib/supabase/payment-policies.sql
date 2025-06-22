-- RLS Policies for payments table

-- Enable RLS on payments table (if not already enabled)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Residents can view their own payments
CREATE POLICY "Residents can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Residents can update their own payments (for confirming payments)
CREATE POLICY "Residents can update own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can create payments
CREATE POLICY "Admins can create payments" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all payments (for marking as paid, etc.)
CREATE POLICY "Admins can update all payments" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete payments
CREATE POLICY "Admins can delete payments" ON payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  ); 