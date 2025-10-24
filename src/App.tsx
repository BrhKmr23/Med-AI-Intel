import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { PatientAuthProvider } from "./lib/patientAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProtectedPatientRoute } from "./components/ProtectedPatientRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientAuth from "./pages/PatientAuth";
import Dashboard from "./pages/Dashboard";
import PatientPortal from "./pages/PatientPortal";
import RegisteredPatients from "./pages/RegisteredPatients";
import Outpatient from "./pages/Outpatient";
import Emergency from "./pages/Emergency";
import Inpatient from "./pages/Inpatient";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PatientAuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/patient-login" element={<PatientAuth />} />
              <Route 
                path="/patient-portal" 
                element={
                  <ProtectedPatientRoute>
                    <PatientPortal />
                  </ProtectedPatientRoute>
                } 
              />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patients" 
              element={
                <ProtectedRoute>
                  <RegisteredPatients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/outpatient" 
              element={
                <ProtectedRoute>
                  <Outpatient />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emergency" 
              element={
                <ProtectedRoute>
                  <Emergency />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inpatient" 
              element={
                <ProtectedRoute>
                  <Inpatient />
                </ProtectedRoute>
              } 
            />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PatientAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
