// User Types
export type UserRole = 'Admin' | 'Team Lead' | 'Executive' | 'Consultant' | 'Publisher' | 'Digital Manager';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Lead Types
export type LeadStatus = 'active' | 'converted' | 'lost' | 'dormant';

export interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  source_id?: number;
  source?: Source;
  stage_id?: number;
  stage?: Stage;
  assigned_to?: number;
  assigned_user?: User;
  status: LeadStatus;
  re_inquiry_count: number;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
  has_application: boolean;
}

// Application Types
export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'in_review';
export type FeeStatus = 'pending' | 'paid' | 'waived' | 'partial';
export type AdmissionStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'conditional';
export type EnrollmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'deferred';
export type OverallStatus = 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

export interface Application {
  id: number;
  lead_id: number;
  lead?: Lead;
  document_status: DocumentStatus;
  document_notes?: string;
  document_verified_at?: string;
  fee_status: FeeStatus;
  fee_amount?: number;
  fee_paid_at?: string;
  admission_status: AdmissionStatus;
  admission_decision_at?: string;
  admission_decision_by?: number;
  enrollment_status: EnrollmentStatus;
  enrollment_date?: string;
  overall_status: OverallStatus;
  created_at: string;
  updated_at: string;
}

// Task Types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 'follow_up' | 'call' | 'email' | 'meeting' | 'document_collection' | 'fee_reminder' | 'system';

export interface Task {
  id: number;
  title: string;
  description?: string;
  task_type: TaskType;
  due_date?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: number;
  assigned_user?: User;
  lead_id?: number;
  lead?: Lead;
  created_by?: number;
  completed_at?: string;
  completed_by?: number;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;
}

// Activity Types
export type ActivityType = 
  | 'call' 
  | 'email' 
  | 'sms' 
  | 'whatsapp' 
  | 'note' 
  | 'system' 
  | 'stage_change' 
  | 'task_created' 
  | 'task_completed' 
  | 'document_uploaded' 
  | 'fee_paid' 
  | 'application_created' 
  | 'meeting' 
  | 'follow_up'
  | 'lead_created'
  | 'lead_updated';

export interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  lead_id: number;
  user_id?: number;
  user?: User;
  metadata?: Record<string, any>;
  created_at: string;
}

// Stage Types
export type StageType = 'lead' | 'application';

export interface Stage {
  id: number;
  name: string;
  type: StageType;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Source Types
export interface Source {
  id: number;
  name: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Publisher Types
export interface Publisher {
  id: number;
  name: string;
  email: string;
  phone?: string;
  lead_limit: number;
  priority: number;
  is_active: boolean;
  leads_submitted: number;
  leads_converted: number;
  conversion_rate: number;
  user_id?: number;
  created_at: string;
  updated_at: string;
}

// Workflow Types
export interface Workflow {
  id: number;
  name: string;
  description?: string;
  trigger: string;
  trigger_conditions?: Record<string, any>;
  actions: WorkflowAction[];
  active: boolean;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  type: string;
  [key: string]: any;
}

// Report Types
export interface DashboardStats {
  leads: {
    total: number;
    active: number;
    new_today: number;
  };
  applications: {
    total: number;
    pending: number;
    completed: number;
  };
  tasks: {
    pending: number;
    overdue: number;
  };
  conversion_rate: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface SourcePerformance {
  source_id: number;
  source_name: string;
  category: string;
  total_leads: number;
  converted: number;
  applications: number;
  conversion_rate: number;
}

export interface UserPerformance {
  user_id: number;
  user_name: string;
  role: UserRole;
  leads_assigned: number;
  leads_converted: number;
  conversion_rate: number;
  tasks_completed: number;
  activities: number;
}

// Pagination Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}

// API Types
export interface ApiError {
  error: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Form Types
export interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  source_id?: number;
  stage_id?: number;
  assigned_to?: number;
}

export interface TaskFormData {
  title: string;
  description?: string;
  task_type: TaskType;
  due_date?: string;
  priority: TaskPriority;
  assigned_to?: number;
  lead_id?: number;
}

export interface ApplicationStatusUpdate {
  document_status?: DocumentStatus;
  fee_status?: FeeStatus;
  admission_status?: AdmissionStatus;
  enrollment_status?: EnrollmentStatus;
  overall_status?: OverallStatus;
  document_notes?: string;
}
