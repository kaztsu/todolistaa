import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule } from '../context/ScheduleContext';
import type { ScheduledItem, TaskItem } from '../scheduleTypes';

const timeToMinutes = (t: string) => {
  const [hh, mm] = t.split(':').map(Number);
  return hh * 60 + mm;
};
const minutesToTime = (m: number) => {
  const hh = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

export const PlanPage: React.FC = () => {
  const { fixedEvents, tasks, scheduled, setScheduled } = useSchedule();
  const navigate = useNavigate();

  useEffect(() => {
    // 簡易スケジューラ
    const dayStart = 8 * 60; // 08:00
    const dayEnd = 20 * 60; // 20:00

    const sortedFixed = [...fixedEvents].sort((a,b)=>timeToMinutes(a.startTime)-timeToMinutes(b.startTime));

    // build free slots
    const freeSlots: { start: number; end: number }[] = [];
    let cursor = dayStart;
    for (const f of sortedFixed) {
      const s = Math.max(timeToMinutes(f.startTime), dayStart);
      const e = Math.min(timeToMinutes(f.endTime), dayEnd);
      if (s > cursor) freeSlots.push({ start: cursor, end: s });
      cursor = Math.max(cursor, e);
    }
    if (cursor < dayEnd) freeSlots.push({ start: cursor, end: dayEnd });

    const result: ScheduledItem[] = [];

    // add fixed events first
    for (const f of sortedFixed) {
      result.push({ id: f.id, title: f.title, startTime: f.startTime, endTime: f.endTime, type: 'fixed' });
    }

    // allocate tasks into free slots, allowing splitting across slots
    let slotIndex = 0;
    for (const t of tasks as TaskItem[]) {
      let remaining = t.durationMinutes;
      let part = 0;
      while (remaining > 0 && slotIndex < freeSlots.length) {
        const slot = freeSlots[slotIndex];
        const slotAvailable = slot.end - slot.start;
        if (slotAvailable <= 0) { slotIndex++; continue; }
        const take = Math.min(remaining, slotAvailable);
        const start = slot.start;
        const end = slot.start + take;
        // push scheduled item
        result.push({ id: `${t.id}-${part}`, title: t.title + (remaining - take > 0 ? ' (part)' : ''), startTime: minutesToTime(start), endTime: minutesToTime(end), type: 'task' });
        // advance slot start
        freeSlots[slotIndex].start = end;
        remaining -= take;
        part++;
        if (freeSlots[slotIndex].start >= freeSlots[slotIndex].end) slotIndex++;
      }
    }

    // sort result by start time
    result.sort((a,b)=>timeToMinutes(a.startTime)-timeToMinutes(b.startTime));
    setScheduled(result);
  }, [fixedEvents, tasks, setScheduled]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">自動生成された1日のタイムライン</h2>
      <div className="space-y-2">
        {scheduled.length === 0 && <div className="text-gray-500">スケジュールが空です。</div>}
        {scheduled.map(item => (
          <div key={item.id} className="p-3 rounded flex justify-between items-center"
            style={{ backgroundColor: item.type === 'fixed' ? '#bfdbfe' : '#bbf7d0' }}>
            <div>
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-gray-700">{item.startTime} — {item.endTime}</div>
            </div>
            <div className="text-sm text-gray-600">{item.type === 'fixed' ? 'Fixed' : 'Task'}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button onClick={()=>navigate('/')} className="bg-gray-600 text-white px-4 py-2 rounded">戻る</button>
      </div>
    </div>
  );
};

export default PlanPage;
