import { supabase } from '@/integrations/supabase/client';

export interface DepartmentMetrics {
  active: number;
  pending: number;
  critical: number;
  completed: number;
}

export const fetchDoctorMetrics = async (): Promise<DepartmentMetrics> => {
  const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const { data: waiting } = await supabase
    .from('patient_queue')
    .select('*')
    .eq('queue_status', 'waiting');

  const { data: critical } = await supabase
    .from('vitals')
    .select('*')
    .eq('is_critical', true)
    .gte('recorded_at', today);

  const { data: inProgress } = await supabase
    .from('patient_queue')
    .select('*')
    .eq('queue_status', 'in_progress');

  const { data: completed } = await supabase
    .from('appointments')
    .select('*')
    .eq('status', 'completed')
    .gte('created_at', today);

  return {
    active: inProgress?.length || 0,
    pending: waiting?.length || 0,
    critical: critical?.length || 0,
    completed: completed?.length || 0,
  };
};

export const fetchNurseMetrics = async (): Promise<DepartmentMetrics> => {
  const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const { data: checkedIn } = await supabase
    .from('appointments')
    .select('id, patient_id')
    .eq('status', 'checked_in');

  let pending = 0;
  if (checkedIn) {
    for (const appointment of checkedIn) {
      const { data: vitals } = await supabase
        .from('vitals')
        .select('id')
        .eq('appointment_id', appointment.id)
        .limit(1);
      
      if (!vitals || vitals.length === 0) {
        pending++;
      }
    }
  }

  const { data: critical } = await supabase
    .from('vitals')
    .select('*')
    .eq('is_critical', true)
    .gte('recorded_at', today);

  const { data: tasks } = await supabase
    .from('nurse_tasks')
    .select('*')
    .eq('completed', false);

  const { data: completed } = await supabase
    .from('vitals')
    .select('*')
    .gte('recorded_at', today);

  return {
    active: tasks?.length || 0,
    pending,
    critical: critical?.length || 0,
    completed: completed?.length || 0,
  };
};

export const fetchReceptionMetrics = async (): Promise<DepartmentMetrics> => {
  const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const { data: walkIns } = await supabase
    .from('appointments')
    .select('*')
    .eq('appointment_type', 'walk-in')
    .gte('created_at', today);

  const { data: scheduled } = await supabase
    .from('appointments')
    .select('*')
    .eq('appointment_type', 'scheduled')
    .gte('created_at', today);

  const { data: pending } = await supabase
    .from('appointments')
    .select('*')
    .eq('status', 'scheduled')
    .gte('created_at', today);

  const { data: checkedIn } = await supabase
    .from('appointments')
    .select('*')
    .eq('status', 'checked_in')
    .gte('created_at', today);

  return {
    active: scheduled?.length || 0,
    pending: pending?.length || 0,
    critical: 0,
    completed: checkedIn?.length || 0,
  };
};

export const fetchLabMetrics = async (): Promise<DepartmentMetrics> => {
  const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const { data: pending } = await supabase
    .from('lab_orders')
    .select('*')
    .eq('status', 'pending');

  const { data: inProgress } = await supabase
    .from('lab_orders')
    .select('*')
    .eq('status', 'in_progress');

  const { data: critical } = await supabase
    .from('lab_orders')
    .select('*')
    .eq('priority', 'urgent')
    .in('status', ['pending', 'in_progress']);

  const { data: completed } = await supabase
    .from('lab_orders')
    .select('*')
    .eq('status', 'completed')
    .gte('completed_at', today);

  return {
    active: inProgress?.length || 0,
    pending: pending?.length || 0,
    critical: critical?.length || 0,
    completed: completed?.length || 0,
  };
};

export const fetchPharmacyMetrics = async (): Promise<DepartmentMetrics> => {
  const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const { data: pending } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('status', 'pending');

  const { data: lowStock } = await supabase
    .from('pharmacy_inventory')
    .select('*')
    .lt('quantity', 10);

  const { data: dispensed } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('status', 'dispensed')
    .gte('dispensed_at', today);

  return {
    active: pending?.length || 0,
    pending: pending?.length || 0,
    critical: lowStock?.length || 0,
    completed: dispensed?.length || 0,
  };
};

export const fetchBillingMetrics = async (): Promise<DepartmentMetrics> => {
  const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const { data: pending } = await supabase
    .from('billing')
    .select('*')
    .eq('payment_status', 'pending');

  const { data: overdue } = await supabase
    .from('billing')
    .select('*')
    .eq('payment_status', 'overdue');

  const { data: paid } = await supabase
    .from('billing')
    .select('*')
    .eq('payment_status', 'paid')
    .gte('paid_at', today);

  return {
    active: pending?.length || 0,
    pending: pending?.length || 0,
    critical: overdue?.length || 0,
    completed: paid?.length || 0,
  };
};

export const fetchITMetrics = async (): Promise<DepartmentMetrics> => {
  const { data: users } = await supabase
    .from('user_roles')
    .select('role');

  const { data: equipment } = await supabase
    .from('biomedical_equipment')
    .select('*')
    .eq('status', 'operational');

  const { data: maintenance } = await supabase
    .from('equipment_maintenance')
    .select('*')
    .eq('status', 'pending');

  return {
    active: users?.length || 0,
    pending: maintenance?.length || 0,
    critical: 0,
    completed: equipment?.length || 0,
  };
};
