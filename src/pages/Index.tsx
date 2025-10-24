import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight, Shield, Stethoscope, AlertCircle, BedDouble } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Hospital Management</span>
        </div>
        <Button onClick={() => navigate('/auth')}>
          Sign In
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Activity className="h-4 w-4" />
            Healthcare Technology Platform
          </div>
          
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Unified Hospital Management{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              System
            </span>
          </h1>
          
          <p className="mb-8 text-xl text-muted-foreground">
            Streamline patient flow, optimize clinical workflows, and enhance care delivery with our
            integrated digital healthcare solution.
          </p>
          
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg h-12 px-8">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Workflow Selection */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Hospital Workflows</h2>
          <p className="text-lg text-muted-foreground">
            Select the appropriate workflow for patient care management
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {/* Outpatient Workflow */}
          <div className="group rounded-2xl border-2 border-primary/20 bg-card p-8 shadow-lg transition-all hover:border-primary hover:shadow-xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Stethoscope className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-primary">Outpatient</h3>
            <p className="mb-6 text-muted-foreground">
              Manage ambulatory care workflow from registration to discharge with complete consultation tracking.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/outpatient')}
              className="w-full group-hover:bg-primary/90"
            >
              Access Outpatient
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Emergency Workflow */}
          <div className="group rounded-2xl border-2 border-destructive/20 bg-card p-8 shadow-lg transition-all hover:border-destructive hover:shadow-xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-destructive">Emergency</h3>
            <p className="mb-6 text-muted-foreground">
              Critical care pathway for emergency department with rapid triage and immediate intervention protocols.
            </p>
            <Button 
              size="lg" 
              variant="destructive"
              onClick={() => navigate('/emergency')}
              className="w-full group-hover:bg-destructive/90"
            >
              Access Emergency
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Inpatient Workflow */}
          <div className="group rounded-2xl border-2 border-secondary/20 bg-card p-8 shadow-lg transition-all hover:border-secondary hover:shadow-xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <BedDouble className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-secondary">Inpatient</h3>
            <p className="mb-6 text-muted-foreground">
              Comprehensive admitted patient management with continuous monitoring and care coordination.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/inpatient')}
              className="w-full group-hover:bg-secondary/90"
            >
              Access Inpatient
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 p-12 text-center">
          <Shield className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h2 className="mb-4 text-3xl font-bold">Secure & Compliant</h2>
          <p className="mb-8 text-lg text-muted-foreground mx-auto max-w-2xl">
            Built with healthcare security in mind. Role-based access control, encrypted data storage,
            and comprehensive audit logs ensure patient privacy and regulatory compliance.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
            Access System
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-semibold">Hospital Management System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
