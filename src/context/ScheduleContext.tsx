import React, { createContext, useContext, useState } from 'react';
import type { FixedEvent, TaskItem, ScheduledItem } from '../scheduleTypes';

interface ScheduleContextValue {
  fixedEvents: FixedEvent[];
  setFixedEvents: React.Dispatch<React.SetStateAction<FixedEvent[]>>;
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  scheduled: ScheduledItem[];
  setScheduled: React.Dispatch<React.SetStateAction<ScheduledItem[]>>;
}

const ScheduleContext = createContext<ScheduleContextValue | undefined>(undefined);

export const ScheduleProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledItem[]>([]);

  return (
    <ScheduleContext.Provider value={{ fixedEvents, setFixedEvents, tasks, setTasks, scheduled, setScheduled }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
};
