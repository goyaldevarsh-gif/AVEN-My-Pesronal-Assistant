// Types mirror supabase/migrations/0001_init.sql columns (snake_case on purpose: no mapping layer).
export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'done' | 'cancelled';
export interface Task {
  id: string; user_id: string; project_id: string | null; parent_task_id: string | null;
  title: string; notes: string | null; status: TaskStatus; priority: 1 | 2 | 3 | 4; category: string | null;
  due_at: string | null; due_date: string | null; snoozed_until: string | null; recurrence_rule: string | null;
  waiting_on_text: string | null; follow_up_at: string | null; is_top_priority: boolean;
  completed_at: string | null; source: 'manual' | 'assistant' | 'inbox' | 'integration';
  created_at: string; updated_at: string; deleted_at: string | null;
}
export type TaskInput = Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { title: string };

export interface Project {
  id: string; user_id: string; title: string; description: string | null; category: string | null;
  status: 'active' | 'on_hold' | 'completed' | 'archived'; due_date: string | null; created_at: string; archived_at: string | null;
}
export type ProjectInput = Partial<Omit<Project, 'id' | 'user_id' | 'created_at'>> & { title: string };

export interface AvenEvent {
  id: string; user_id: string; title: string; description: string | null; location: string | null;
  starts_at: string; ends_at: string; all_day: boolean; deleted_at: string | null;
}
export type EventInput = Partial<Omit<AvenEvent, 'id' | 'user_id'>> & { title: string; starts_at: string; ends_at: string };

export interface Reminder { id: string; task_id: string | null; event_id: string | null; title: string | null; remind_at: string; status: 'scheduled' | 'sent' | 'dismissed' | 'snoozed' }
export interface ReminderInput { task_id?: string | null; event_id?: string | null; title?: string | null; remind_at: string }

export interface InboxItem {
  id: string; user_id: string; raw_text: string | null; raw_kind: 'text' | 'voice' | 'link' | 'photo' | 'document';
  status: 'new' | 'needs_review' | 'confirmed' | 'dismissed'; resolved_entity_type: string | null; resolved_entity_id: string | null;
  created_at: string; resolved_at: string | null;
}
export interface Note {
  id: string; user_id: string; title: string | null; body: string; kind: 'note' | 'idea' | 'link' | 'shopping' | 'reference' | 'important';
  url: string | null; tags: string[]; created_at: string; updated_at: string; archived_at: string | null;
}
export type NoteInput = Partial<Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { body: string };

export interface Profile { user_id: string; display_name: string | null; timezone: string; locale: string; week_starts_on: number }

/** Everything the UI needs from storage. Implemented by Supabase (real) and memory (demo only). */
export interface Repo {
  getProfile(): Promise<Profile>;
  updateProfile(p: Partial<Pick<Profile, 'display_name' | 'timezone' | 'week_starts_on'>>): Promise<Profile>;
  listTasks(): Promise<Task[]>;
  createTask(i: TaskInput): Promise<Task>;
  updateTask(id: string, patch: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  listProjects(): Promise<Project[]>;
  createProject(i: ProjectInput): Promise<Project>;
  updateProject(id: string, patch: Partial<Project>): Promise<Project>;
  listEvents(fromIso: string, toIso: string): Promise<AvenEvent[]>;
  createEvent(i: EventInput): Promise<AvenEvent>;
  deleteEvent(id: string): Promise<void>;
  createReminder(i: ReminderInput): Promise<Reminder>;
  listReminders(): Promise<Reminder[]>;
  listInbox(): Promise<InboxItem[]>;
  captureInbox(text: string): Promise<InboxItem>;
  resolveInbox(id: string, status: 'confirmed' | 'dismissed', entityType?: string, entityId?: string): Promise<void>;
  listNotes(): Promise<Note[]>;
  createNote(i: NoteInput): Promise<Note>;
  updateNote(id: string, patch: Partial<Note>): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  exportAll(): Promise<Record<string, unknown>>;
}
