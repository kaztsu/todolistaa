import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule } from '../context/ScheduleContext';
import type { FixedEvent, TaskItem } from '../scheduleTypes';

export const InputPage: React.FC = () => {
  const { fixedEvents, setFixedEvents, tasks, setTasks } = useSchedule();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDuration, setTaskDuration] = useState<number>(30);
  const navigate = useNavigate();

  // simple incremental id generator for this module
  const idCounter = React.useRef<number | null>(null);
  if (idCounter.current === null) idCounter.current = 2000;
  const generateId = () => String((idCounter.current = (idCounter.current || 2000) + 1));

  const addFixed = (e: React.FormEvent) => {
    e.preventDefault();
    const fe: FixedEvent = { id: generateId(), title, startTime, endTime };
    setFixedEvents([...fixedEvents, fe]);
    setTitle('');
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const t: TaskItem = { id: generateId(), title: taskTitle, durationMinutes: Number(taskDuration) };
    setTasks([...tasks, t]);
    setTaskTitle('');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">確定済みの予定 (Fixed Events)</h2>
      <form onSubmit={addFixed} className="mb-6">
        <div className="flex gap-2">
          <input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="タイトル" className="border p-2 rounded flex-1" />
          <input required type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="border p-2 rounded" />
          <input required type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="border p-2 rounded" />
          <button className="bg-blue-600 text-white px-4 rounded">追加</button>
        </div>
      </form>

      <div className="mb-6">
        <h3 className="font-semibold">現在の確定予定</h3>
        <ul className="mt-2 space-y-2">
          {fixedEvents.map(fe => (
            <li key={fe.id} className="p-2 bg-blue-100 rounded">
              {fe.title} — {fe.startTime}〜{fe.endTime}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="text-2xl font-bold mb-4">やりたいタスク (Tasks)</h2>
      <form onSubmit={addTask} className="mb-6">
        <div className="flex gap-2">
          <input required value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="タスク名" className="border p-2 rounded flex-1" />
          <input required type="number" min={1} value={taskDuration} onChange={e=>setTaskDuration(Number(e.target.value))} className="border p-2 rounded w-28" />
          <span className="self-center">分</span>
          <button className="bg-green-600 text-white px-4 rounded">追加</button>
        </div>
      </form>

      <div className="mb-6">
        <h3 className="font-semibold">現在のタスク</h3>
        <ul className="mt-2 space-y-2">
          {tasks.map(t => (
            <li key={t.id} className="p-2 bg-green-100 rounded">
              {t.title} — {t.durationMinutes}分
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <button onClick={()=>navigate('/plan')} className="bg-indigo-600 text-white px-4 py-2 rounded">スケジュールを作成する</button>
      </div>
    </div>
  );
};

export default InputPage;
