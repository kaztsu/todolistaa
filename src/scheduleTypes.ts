export interface FixedEvent {
  id: string;
  title: string;
  startTime: string; // "10:00"
  endTime: string;   // "11:00"
}

export interface TaskItem {
  id: string;
  title: string;
  durationMinutes: number;
}

export interface ScheduledItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'fixed' | 'task';
}
