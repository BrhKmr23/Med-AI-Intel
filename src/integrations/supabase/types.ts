export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      adr_reports: {
        Row: {
          created_at: string | null
          drug_name: string
          id: string
          onset_date: string
          patient_id: string
          prescription_id: string | null
          reaction_description: string
          reported_by: string
          severity: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          drug_name: string
          id?: string
          onset_date: string
          patient_id: string
          prescription_id?: string | null
          reaction_description: string
          reported_by: string
          severity: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          drug_name?: string
          id?: string
          onset_date?: string
          patient_id?: string
          prescription_id?: string | null
          reaction_description?: string
          reported_by?: string
          severity?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adr_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adr_reports_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string
          created_at: string | null
          created_by: string | null
          department: string
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string
          payment_status: string | null
          scheduled_time: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          token_number: string | null
        }
        Insert: {
          appointment_type: string
          created_at?: string | null
          created_by?: string | null
          department: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          payment_status?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          token_number?: string | null
        }
        Update: {
          appointment_type?: string
          created_at?: string | null
          created_by?: string | null
          department?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          payment_status?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          token_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_logs: {
        Row: {
          failure_reason: string | null
          ip_address: string | null
          log_id: string
          login_timestamp: string | null
          status: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          failure_reason?: string | null
          ip_address?: string | null
          log_id?: string
          login_timestamp?: string | null
          status: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          failure_reason?: string | null
          ip_address?: string | null
          log_id?: string
          login_timestamp?: string | null
          status?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      billing: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          created_by: string | null
          discount: number | null
          id: string
          insurance_claim_id: string | null
          items: Json
          paid_at: string | null
          patient_id: string
          payment_method: string | null
          payment_status: string | null
          subtotal: number
          tax: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          id?: string
          insurance_claim_id?: string | null
          items: Json
          paid_at?: string | null
          patient_id: string
          payment_method?: string | null
          payment_status?: string | null
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          id?: string
          insurance_claim_id?: string | null
          items?: Json
          paid_at?: string | null
          patient_id?: string
          payment_method?: string | null
          payment_status?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      biomedical_equipment: {
        Row: {
          calibration_due_date: string | null
          created_at: string | null
          equipment_name: string
          equipment_type: string
          id: string
          last_service_date: string | null
          location: string
          manufacturer: string | null
          model_number: string | null
          next_service_date: string | null
          notes: string | null
          purchase_date: string | null
          serial_number: string | null
          status: string
          updated_at: string | null
          warranty_expiry: string | null
        }
        Insert: {
          calibration_due_date?: string | null
          created_at?: string | null
          equipment_name: string
          equipment_type: string
          id?: string
          last_service_date?: string | null
          location: string
          manufacturer?: string | null
          model_number?: string | null
          next_service_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          calibration_due_date?: string | null
          created_at?: string | null
          equipment_name?: string
          equipment_type?: string
          id?: string
          last_service_date?: string | null
          location?: string
          manufacturer?: string | null
          model_number?: string | null
          next_service_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          appointment_id: string | null
          chief_complaints: string | null
          consultation_notes: string | null
          created_at: string | null
          cross_consultation_specialty: string | null
          diagnosis: string | null
          doctor_id: string
          examination_findings: string | null
          id: string
          insurance_claim_id: string | null
          insurance_verified: boolean | null
          past_history: string | null
          patient_id: string
          presenting_illness: string | null
          requires_cross_consultation: boolean | null
          treatment_plan: string | null
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          chief_complaints?: string | null
          consultation_notes?: string | null
          created_at?: string | null
          cross_consultation_specialty?: string | null
          diagnosis?: string | null
          doctor_id: string
          examination_findings?: string | null
          id?: string
          insurance_claim_id?: string | null
          insurance_verified?: boolean | null
          past_history?: string | null
          patient_id: string
          presenting_illness?: string | null
          requires_cross_consultation?: boolean | null
          treatment_plan?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          chief_complaints?: string | null
          consultation_notes?: string | null
          created_at?: string | null
          cross_consultation_specialty?: string | null
          diagnosis?: string | null
          doctor_id?: string
          examination_findings?: string | null
          id?: string
          insurance_claim_id?: string | null
          insurance_verified?: boolean | null
          past_history?: string | null
          patient_id?: string
          presenting_illness?: string | null
          requires_cross_consultation?: boolean | null
          treatment_plan?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "outpatient_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      discharge_summaries: {
        Row: {
          admission_required: boolean | null
          created_at: string | null
          discharge_diagnosis: string | null
          doctor_id: string
          follow_up_date: string | null
          follow_up_required: boolean | null
          home_healthcare_required: boolean | null
          id: string
          medications_prescribed: Json | null
          patient_id: string
          special_instructions: string | null
          treatment_summary: string | null
          visit_id: string | null
        }
        Insert: {
          admission_required?: boolean | null
          created_at?: string | null
          discharge_diagnosis?: string | null
          doctor_id: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          home_healthcare_required?: boolean | null
          id?: string
          medications_prescribed?: Json | null
          patient_id: string
          special_instructions?: string | null
          treatment_summary?: string | null
          visit_id?: string | null
        }
        Update: {
          admission_required?: boolean | null
          created_at?: string | null
          discharge_diagnosis?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          home_healthcare_required?: boolean | null
          id?: string
          medications_prescribed?: Json | null
          patient_id?: string
          special_instructions?: string | null
          treatment_summary?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discharge_summaries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discharge_summaries_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "outpatient_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      drug_information: {
        Row: {
          category: string
          contraindications: string | null
          created_at: string | null
          description: string | null
          dosage_forms: string[] | null
          drug_name: string
          generic_name: string | null
          id: string
          indications: string | null
          side_effects: string[] | null
          storage_conditions: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          contraindications?: string | null
          created_at?: string | null
          description?: string | null
          dosage_forms?: string[] | null
          drug_name: string
          generic_name?: string | null
          id?: string
          indications?: string | null
          side_effects?: string[] | null
          storage_conditions?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          contraindications?: string | null
          created_at?: string | null
          description?: string | null
          dosage_forms?: string[] | null
          drug_name?: string
          generic_name?: string | null
          id?: string
          indications?: string | null
          side_effects?: string[] | null
          storage_conditions?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      drug_interactions: {
        Row: {
          created_at: string | null
          description: string
          drug_a: string
          drug_b: string
          id: string
          recommendation: string | null
          severity: string
        }
        Insert: {
          created_at?: string | null
          description: string
          drug_a: string
          drug_b: string
          id?: string
          recommendation?: string | null
          severity: string
        }
        Update: {
          created_at?: string | null
          description?: string
          drug_a?: string
          drug_b?: string
          id?: string
          recommendation?: string | null
          severity?: string
        }
        Relationships: []
      }
      equipment_maintenance: {
        Row: {
          completed_date: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          equipment_id: string
          findings: string | null
          id: string
          maintenance_type: string
          next_maintenance_date: string | null
          priority: string
          scheduled_date: string
          status: string
          technician_id: string | null
          updated_at: string | null
          work_order_number: string | null
        }
        Insert: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          equipment_id: string
          findings?: string | null
          id?: string
          maintenance_type: string
          next_maintenance_date?: string | null
          priority?: string
          scheduled_date: string
          status?: string
          technician_id?: string | null
          updated_at?: string | null
          work_order_number?: string | null
        }
        Update: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          equipment_id?: string
          findings?: string | null
          id?: string
          maintenance_type?: string
          next_maintenance_date?: string | null
          priority?: string
          scheduled_date?: string
          status?: string
          technician_id?: string | null
          updated_at?: string | null
          work_order_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_maintenance_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "biomedical_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_plans: {
        Row: {
          coverage_details: Json | null
          created_at: string | null
          effective_date: string
          expiry_date: string | null
          group_number: string | null
          is_active: boolean | null
          patient_id: string
          plan_id: string
          plan_type: string | null
          policy_number: string
          provider_name: string
          updated_at: string | null
        }
        Insert: {
          coverage_details?: Json | null
          created_at?: string | null
          effective_date: string
          expiry_date?: string | null
          group_number?: string | null
          is_active?: boolean | null
          patient_id: string
          plan_id?: string
          plan_type?: string | null
          policy_number: string
          provider_name: string
          updated_at?: string | null
        }
        Update: {
          coverage_details?: Json | null
          created_at?: string | null
          effective_date?: string
          expiry_date?: string | null
          group_number?: string | null
          is_active?: boolean | null
          patient_id?: string
          plan_id?: string
          plan_type?: string | null
          policy_number?: string
          provider_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      investigation_orders: {
        Row: {
          completed_at: string | null
          consultation_id: string | null
          created_at: string | null
          doctor_id: string
          id: string
          order_details: Json
          order_type: string | null
          patient_id: string
          status: string | null
          visit_id: string | null
        }
        Insert: {
          completed_at?: string | null
          consultation_id?: string | null
          created_at?: string | null
          doctor_id: string
          id?: string
          order_details: Json
          order_type?: string | null
          patient_id: string
          status?: string | null
          visit_id?: string | null
        }
        Update: {
          completed_at?: string | null
          consultation_id?: string | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          order_details?: Json
          order_type?: string | null
          patient_id?: string
          status?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investigation_orders_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "care_encounters"
            referencedColumns: ["encounter_id"]
          },
          {
            foreignKeyName: "investigation_orders_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigation_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigation_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "outpatient_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          appointment_id: string | null
          completed_at: string | null
          created_at: string | null
          critical_findings: string | null
          doctor_id: string
          id: string
          interpretation: string | null
          notes: string | null
          order_type: string
          patient_id: string
          pdf_upload_url: string | null
          priority: string | null
          queue_id: string | null
          report_url: string | null
          results: Json | null
          sample_collected_at: string | null
          sample_id: string | null
          sample_received_at: string | null
          status: string | null
          technician_id: string | null
          test_name: string
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          appointment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          critical_findings?: string | null
          doctor_id: string
          id?: string
          interpretation?: string | null
          notes?: string | null
          order_type: string
          patient_id: string
          pdf_upload_url?: string | null
          priority?: string | null
          queue_id?: string | null
          report_url?: string | null
          results?: Json | null
          sample_collected_at?: string | null
          sample_id?: string | null
          sample_received_at?: string | null
          status?: string | null
          technician_id?: string | null
          test_name: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          appointment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          critical_findings?: string | null
          doctor_id?: string
          id?: string
          interpretation?: string | null
          notes?: string | null
          order_type?: string
          patient_id?: string
          pdf_upload_url?: string | null
          priority?: string | null
          queue_id?: string | null
          report_url?: string | null
          results?: Json | null
          sample_collected_at?: string | null
          sample_id?: string | null
          sample_received_at?: string | null
          status?: string | null
          technician_id?: string | null
          test_name?: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "patient_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_conditions: {
        Row: {
          condition_id: string
          created_at: string | null
          diagnosis_code: string | null
          diagnosis_name: string
          end_date: string | null
          notes: string | null
          patient_id: string
          provider_id: string | null
          severity: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          condition_id?: string
          created_at?: string | null
          diagnosis_code?: string | null
          diagnosis_name: string
          end_date?: string | null
          notes?: string | null
          patient_id: string
          provider_id?: string | null
          severity?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          condition_id?: string
          created_at?: string | null
          diagnosis_code?: string | null
          diagnosis_name?: string
          end_date?: string | null
          notes?: string | null
          patient_id?: string
          provider_id?: string | null
          severity?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_conditions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_conditions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nurse_tasks: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          nurse_id: string
          patient_id: string
          scheduled_time: string | null
          task_description: string | null
          task_type: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          nurse_id: string
          patient_id: string
          scheduled_time?: string | null
          task_description?: string | null
          task_type: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          nurse_id?: string
          patient_id?: string
          scheduled_time?: string | null
          task_description?: string | null
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "nurse_tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      outpatient_visits: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_step: string | null
          entry_triage_notes: string | null
          id: string
          is_emergency: boolean | null
          patient_id: string
          registration_type: string | null
          status: string | null
          token_number: string | null
          updated_at: string | null
          visit_date: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_step?: string | null
          entry_triage_notes?: string | null
          id?: string
          is_emergency?: boolean | null
          patient_id: string
          registration_type?: string | null
          status?: string | null
          token_number?: string | null
          updated_at?: string | null
          visit_date?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_step?: string | null
          entry_triage_notes?: string | null
          id?: string
          is_emergency?: boolean | null
          patient_id?: string
          registration_type?: string | null
          status?: string | null
          token_number?: string | null
          updated_at?: string | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outpatient_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      outsourced_tests: {
        Row: {
          created_at: string | null
          external_lab_email: string
          external_lab_name: string
          external_report_url: string | null
          id: string
          lab_order_id: string | null
          notes: string | null
          patient_id: string
          received_at: string | null
          sample_id: string | null
          sent_at: string | null
          status: string
          test_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_lab_email: string
          external_lab_name: string
          external_report_url?: string | null
          id?: string
          lab_order_id?: string | null
          notes?: string | null
          patient_id: string
          received_at?: string | null
          sample_id?: string | null
          sent_at?: string | null
          status?: string
          test_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_lab_email?: string
          external_lab_name?: string
          external_report_url?: string | null
          id?: string
          lab_order_id?: string | null
          notes?: string | null
          patient_id?: string
          received_at?: string | null
          sample_id?: string | null
          sent_at?: string | null
          status?: string
          test_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outsourced_tests_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outsourced_tests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_feedback: {
        Row: {
          created_at: string | null
          feedback_category: string | null
          feedback_text: string | null
          id: string
          patient_id: string
          rating: number | null
          visit_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_category?: string | null
          feedback_text?: string | null
          id?: string
          patient_id: string
          rating?: number | null
          visit_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_category?: string | null
          feedback_text?: string | null
          id?: string
          patient_id?: string
          rating?: number | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_feedback_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_feedback_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "outpatient_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_portal_users: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          is_active: boolean | null
          last_login: string | null
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_portal_users_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_queue: {
        Row: {
          appointment_id: string | null
          assigned_doctor_id: string | null
          awaiting_lab_results: boolean | null
          created_by: string | null
          department: string
          escalated: boolean | null
          escalation_reason: string | null
          id: string
          on_hold_reason: string | null
          patient_id: string
          position: number | null
          priority_score: number
          queue_status: Database["public"]["Enums"]["queue_status"] | null
          time_completed: string | null
          time_enqueued: string | null
          time_started: string | null
          triage_id: string | null
          wait_time_minutes: number | null
        }
        Insert: {
          appointment_id?: string | null
          assigned_doctor_id?: string | null
          awaiting_lab_results?: boolean | null
          created_by?: string | null
          department: string
          escalated?: boolean | null
          escalation_reason?: string | null
          id?: string
          on_hold_reason?: string | null
          patient_id: string
          position?: number | null
          priority_score?: number
          queue_status?: Database["public"]["Enums"]["queue_status"] | null
          time_completed?: string | null
          time_enqueued?: string | null
          time_started?: string | null
          triage_id?: string | null
          wait_time_minutes?: number | null
        }
        Update: {
          appointment_id?: string | null
          assigned_doctor_id?: string | null
          awaiting_lab_results?: boolean | null
          created_by?: string | null
          department?: string
          escalated?: boolean | null
          escalation_reason?: string | null
          id?: string
          on_hold_reason?: string | null
          patient_id?: string
          position?: number | null
          priority_score?: number
          queue_status?: Database["public"]["Enums"]["queue_status"] | null
          time_completed?: string | null
          time_enqueued?: string | null
          time_started?: string | null
          triage_id?: string | null
          wait_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_queue_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_queue_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_queue_triage_id_fkey"
            columns: ["triage_id"]
            isOneToOne: false
            referencedRelation: "triage_records"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          blood_group: string | null
          comorbidities: string[] | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          gender: string | null
          government_id: string | null
          id: string
          is_pregnant: boolean | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          blood_group?: string | null
          comorbidities?: string[] | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          gender?: string | null
          government_id?: string | null
          id?: string
          is_pregnant?: boolean | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          blood_group?: string | null
          comorbidities?: string[] | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          government_id?: string | null
          id?: string
          is_pregnant?: boolean | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pharmacy_inventory: {
        Row: {
          batch_number: string
          category: string
          created_at: string | null
          drug_name: string
          expiry_date: string
          generic_name: string | null
          id: string
          location: string | null
          manufacturer: string | null
          quantity: number
          reorder_level: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          batch_number: string
          category: string
          created_at?: string | null
          drug_name: string
          expiry_date: string
          generic_name?: string | null
          id?: string
          location?: string | null
          manufacturer?: string | null
          quantity?: number
          reorder_level?: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          batch_number?: string
          category?: string
          created_at?: string | null
          drug_name?: string
          expiry_date?: string
          generic_name?: string | null
          id?: string
          location?: string | null
          manufacturer?: string | null
          quantity?: number
          reorder_level?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          dispensed_at: string | null
          dispensed_by: string | null
          doctor_id: string
          id: string
          medications: Json
          notes: string | null
          patient_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          doctor_id: string
          id?: string
          medications: Json
          notes?: string | null
          patient_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          doctor_id?: string
          id?: string
          medications?: Json
          notes?: string | null
          patient_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          employee_id: string | null
          full_name: string
          id: string
          phone: string | null
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          full_name: string
          id: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      triage_records: {
        Row: {
          computed_level: Database["public"]["Enums"]["triage_level"]
          evaluated_at: string | null
          evaluated_by: string
          id: string
          manual_override: boolean | null
          override_reason: string | null
          patient_id: string
          priority_notes: string | null
          risk_factors: string[] | null
          triage_level: Database["public"]["Enums"]["triage_level"]
          triage_score: number
          vitals_id: string | null
        }
        Insert: {
          computed_level: Database["public"]["Enums"]["triage_level"]
          evaluated_at?: string | null
          evaluated_by: string
          id?: string
          manual_override?: boolean | null
          override_reason?: string | null
          patient_id: string
          priority_notes?: string | null
          risk_factors?: string[] | null
          triage_level: Database["public"]["Enums"]["triage_level"]
          triage_score: number
          vitals_id?: string | null
        }
        Update: {
          computed_level?: Database["public"]["Enums"]["triage_level"]
          evaluated_at?: string | null
          evaluated_by?: string
          id?: string
          manual_override?: boolean | null
          override_reason?: string | null
          patient_id?: string
          priority_notes?: string | null
          risk_factors?: string[] | null
          triage_level?: Database["public"]["Enums"]["triage_level"]
          triage_score?: number
          vitals_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "triage_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triage_records_vitals_id_fkey"
            columns: ["vitals_id"]
            isOneToOne: false
            referencedRelation: "vitals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vitals: {
        Row: {
          appointment_id: string | null
          bmi: number | null
          bp_diastolic: number | null
          bp_systolic: number | null
          created_by: string | null
          doctor_id: string | null
          heart_rate: number | null
          height: number | null
          id: string
          is_critical: boolean | null
          is_retaken: boolean | null
          nurse_id: string
          patient_id: string
          recorded_at: string | null
          respiratory_rate: number | null
          retake_reason: string | null
          spo2: number | null
          symptoms: string[] | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          appointment_id?: string | null
          bmi?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          created_by?: string | null
          doctor_id?: string | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          is_critical?: boolean | null
          is_retaken?: boolean | null
          nurse_id: string
          patient_id: string
          recorded_at?: string | null
          respiratory_rate?: number | null
          retake_reason?: string | null
          spo2?: number | null
          symptoms?: string[] | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          appointment_id?: string | null
          bmi?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          created_by?: string | null
          doctor_id?: string | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          is_critical?: boolean | null
          is_retaken?: boolean | null
          nurse_id?: string
          patient_id?: string
          recorded_at?: string | null
          respiratory_rate?: number | null
          retake_reason?: string | null
          spo2?: number | null
          symptoms?: string[] | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      care_encounters: {
        Row: {
          appointment_id: string | null
          date_time: string | null
          diagnosis: string | null
          encounter_id: string | null
          encounter_type: string | null
          patient_id: string | null
          provider_id: string | null
          summary_notes: string | null
          treatment_plan: string | null
        }
        Insert: {
          appointment_id?: string | null
          date_time?: string | null
          diagnosis?: string | null
          encounter_id?: string | null
          encounter_type?: never
          patient_id?: string | null
          provider_id?: string | null
          summary_notes?: string | null
          treatment_plan?: string | null
        }
        Update: {
          appointment_id?: string | null
          date_time?: string | null
          diagnosis?: string | null
          encounter_id?: string | null
          encounter_type?: never
          patient_id?: string | null
          provider_id?: string | null
          summary_notes?: string | null
          treatment_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "receptionist"
        | "pharmacist"
        | "billing_staff"
        | "lab_technician"
        | "it_admin"
        | "patient"
      appointment_status:
        | "scheduled"
        | "checked_in"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      queue_status: "waiting" | "in_progress" | "completed" | "on_hold"
      triage_level: "RED" | "YELLOW" | "GREEN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "doctor",
        "nurse",
        "receptionist",
        "pharmacist",
        "billing_staff",
        "lab_technician",
        "it_admin",
        "patient",
      ],
      appointment_status: [
        "scheduled",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      queue_status: ["waiting", "in_progress", "completed", "on_hold"],
      triage_level: ["RED", "YELLOW", "GREEN"],
    },
  },
} as const
