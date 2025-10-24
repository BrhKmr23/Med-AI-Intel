import { DashboardLayout } from '@/components/dashboards/DashboardLayout';
import { PatientList } from '@/components/patients/PatientList';

const RegisteredPatients = () => {
  return (
    <DashboardLayout title="Registered Patients">
      <PatientList />
    </DashboardLayout>
  );
};

export default RegisteredPatients;
