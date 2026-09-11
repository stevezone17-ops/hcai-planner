export type PriorityType = "Critical" | "High" | "Medium" | "Low";
export type DifficultyType = "Easy" | "Medium" | "Hard";
export type TaskStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  category: string;
  priority: PriorityType;
  duration_minutes: number;
  deadline?: string | null;
  preferred_start?: string | null;
  preferred_end?: string | null;
  difficulty: DifficultyType;
  status: TaskStatus;
  recurrence?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type ScheduleStatus =
  | "PROPOSED"
  | "ACCEPTED"
  | "MODIFIED"
  | "REJECTED"
  | "LOCKED"
  | "COMPLETED"
  | "CANCELLED";

export type ScheduleSource = "AI" | "USER";

export interface ScheduleItem {
  id: number;
  user_id: number;
  task_id: number;
  start_time: string;
  end_time: string;
  source: ScheduleSource;
  status: ScheduleStatus;
  locked: boolean;
  approved: boolean;
  ai_reason?: string | null;
  confidence: number;
  original_start?: string | null;
  original_end?: string | null;
  created_at: string;
  updated_at: string;
  task?: Task | null;
}

export interface Availability {
  id: number;
  user_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface Feedback {
  id: number;
  user_id: number;
  schedule_item_id?: number | null;
  action: string;
  reason?: string | null;
  rating?: number | null;
  comment?: string | null;
  created_at: string;
}

export interface UserPreference {
  id: number;
  user_id: number;
  key: string;
  value: string;
  confidence: number;
  source: string;
  updated_at: string;
}

export interface UnscheduledTask {
  task_id: number;
  title: string;
  priority: string;
  duration_minutes: number;
  reason: string;
  suggested_action: string;
}

export interface PlannerSummary {
  total_tasks_considered: number;
  total_tasks_scheduled: number;
  total_scheduled_hours: number;
  conflicts_resolved: number;
  hitl_status: string;
  explanations_count: number;
}

export interface PlannerResponse {
  proposed_items: ScheduleItem[];
  unscheduled_tasks: UnscheduledTask[];
  summary: PlannerSummary;
  generation_steps: string[];
}

export interface ReplanDiffItem {
  task_id: number;
  task_title: string;
  previous_start: string;
  previous_end: string;
  new_start: string;
  new_end: string;
  status: string;
  reason: string;
}

export interface PlannerReplanResponse {
  rescheduled_items: ScheduleItem[];
  preserved_locked_count: number;
  preserved_accepted_count: number;
  moved_items: ReplanDiffItem[];
  unscheduled_tasks: UnscheduledTask[];
  message: string;
}

export interface HITLMetrics {
  total_proposals: number;
  accepted_count: number;
  modified_count: number;
  rejected_count: number;
  locked_count: number;
  acceptance_rate: number;
  modification_rate: number;
  rejection_rate: number;
  human_intervention_rate: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  hours: number;
}

export interface PriorityBreakdown {
  priority: string;
  count: number;
}

export interface HourlyModification {
  hour: number;
  count: number;
}

export interface AnalyticsData {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  planned_hours: number;
  completed_hours: number;
  schedule_efficiency: number;
  hitl_metrics: HITLMetrics;
  category_distribution: CategoryBreakdown[];
  priority_distribution: PriorityBreakdown[];
  hourly_modifications: HourlyModification[];
  insights: string[];
}
