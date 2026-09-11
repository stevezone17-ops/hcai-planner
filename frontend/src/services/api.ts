import {
  Task,
  Availability,
  ScheduleItem,
  Feedback,
  UserPreference,
  AnalyticsData,
  PlannerResponse,
  PlannerReplanResponse,
} from "../types";

const API_BASE = "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorDetail = "API Error";
    try {
      const errObj = await res.json();
      errorDetail = errObj.detail || errObj.message || JSON.stringify(errObj);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Tasks
  tasks: {
    getAll: (params?: { status?: string; category?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append("status", params.status);
      if (params?.category) query.append("category", params.category);
      const qs = query.toString();
      return fetchJson<Task[]>(`${API_BASE}/tasks${qs ? `?${qs}` : ""}`);
    },
    getById: (id: number) => fetchJson<Task>(`${API_BASE}/tasks/${id}`),
    create: (data: Partial<Task>) =>
      fetchJson<Task>(`${API_BASE}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Task>) =>
      fetchJson<Task>(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchJson<void>(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      }),
  },

  // Availability
  availability: {
    getAll: () => fetchJson<Availability[]>(`${API_BASE}/availability`),
    create: (data: Omit<Availability, "id" | "user_id">) =>
      fetchJson<Availability>(`${API_BASE}/availability`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Availability>) =>
      fetchJson<Availability>(`${API_BASE}/availability/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchJson<void>(`${API_BASE}/availability/${id}`, {
        method: "DELETE",
      }),
    batchUpdate: (availabilities: Omit<Availability, "id" | "user_id">[]) =>
      fetchJson<Availability[]>(`${API_BASE}/availability/batch`, {
        method: "POST",
        body: JSON.stringify({ availabilities }),
      }),
  },

  // Planner
  planner: {
    generate: (payload: {
      task_ids?: number[];
      start_date?: string;
      days_to_plan?: number;
      strategy?: "balanced" | "urgent_first" | "focus_first";
      max_work_hours_per_day?: number;
      focus_session_minutes?: number;
      min_break_minutes?: number;
    }) =>
      fetchJson<PlannerResponse>(`${API_BASE}/planner/generate`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    replan: (payload: {
      start_date?: string;
      unavailability_start?: string;
      unavailability_end?: string;
      reason?: string;
    }) =>
      fetchJson<PlannerReplanResponse>(`${API_BASE}/planner/replan`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // Schedule Items
  schedule: {
    getAll: (params?: { start_date?: string; end_date?: string; include_rejected?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.start_date) query.append("start_date", params.start_date);
      if (params?.end_date) query.append("end_date", params.end_date);
      if (params?.include_rejected) query.append("include_rejected", "true");
      const qs = query.toString();
      return fetchJson<ScheduleItem[]>(`${API_BASE}/schedule${qs ? `?${qs}` : ""}`);
    },
    approve: (id: number) =>
      fetchJson<{ success: boolean; item: ScheduleItem }>(`${API_BASE}/schedule/${id}/approve`, {
        method: "POST",
      }),
    reject: (id: number, reason?: string) =>
      fetchJson<{ success: boolean; item: ScheduleItem }>(`${API_BASE}/schedule/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    modify: (id: number, payload: { start_time: string; end_time?: string; reason?: string }) =>
      fetchJson<{ success: boolean; item: ScheduleItem }>(`${API_BASE}/schedule/${id}/modify`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    lock: (id: number) =>
      fetchJson<{ success: boolean; item: ScheduleItem }>(`${API_BASE}/schedule/${id}/lock`, {
        method: "POST",
      }),
    unlock: (id: number) =>
      fetchJson<{ success: boolean; item: ScheduleItem }>(`${API_BASE}/schedule/${id}/unlock`, {
        method: "POST",
      }),
    complete: (id: number) =>
      fetchJson<{ success: boolean; item: ScheduleItem }>(`${API_BASE}/schedule/${id}/complete`, {
        method: "POST",
      }),
  },

  // Feedback
  feedback: {
    getAll: () => fetchJson<Feedback[]>(`${API_BASE}/feedback`),
    create: (data: Partial<Feedback>) =>
      fetchJson<Feedback>(`${API_BASE}/feedback`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Analytics
  analytics: {
    get: () => fetchJson<AnalyticsData>(`${API_BASE}/analytics`),
  },

  // Preferences
  preferences: {
    getAll: () => fetchJson<UserPreference[]>(`${API_BASE}/preferences`),
    update: (key: string, value: string) =>
      fetchJson<UserPreference>(`${API_BASE}/preferences`, {
        method: "PUT",
        body: JSON.stringify({ key, value }),
      }),
  },

  // Seed / Reset
  seed: {
    reset: () =>
      fetchJson<{ message: string }>(`${API_BASE}/seed/reset`, {
        method: "POST",
      }),
    seed: () =>
      fetchJson<{ message: string }>(`${API_BASE}/seed/seed`, {
        method: "POST",
      }),
  },
};
