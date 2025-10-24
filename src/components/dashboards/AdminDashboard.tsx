import { DashboardLayout } from './DashboardLayout';
import { AdminCommandCenter } from '@/components/admin/AdminCommandCenter';

export const AdminDashboard = () => {
  return (
    <DashboardLayout title="">
      <AdminCommandCenter />
    </DashboardLayout>
  );
};
