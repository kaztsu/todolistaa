import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, CheckCircle, Brain, Coffee, Layout, List, ArrowLeft, RotateCcw, Check, Heart, Star, Sparkles } from 'lucide-react';

type ViewMode = 'input' | 'schedule';

interface FixedEvent {
  id: string;
  title: string;
  startTime: string; 
  endTime: string;   
  startDate?: string; 
  endDate?: string; 
  type: 'fixed';
}

interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  fun: number; 
  kind: 'must' | 'want'; 
  dueDateTime?: string;
  type: 'task';
  completed?: boolean;
}

interface ScheduleItem {
  id: string;
  date: string; 
  timeRange: string;
  title: string;
  type: 'fixed' | 'task' | 'break';
  duration: number;
  fun?: number;
  kind?: 'must' | 'want';
  completed?: boolean;
  dueDateTime?: string;
}

// --- Helper Functions ---
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatDateTime = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('ja-JP', { 
    month: 'numeric', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// LocalStorage Keys
const STORAGE_KEY_FIXED = 'ai_scheduler_fixed_events';
const STORAGE_KEY_TASKS = 'ai_scheduler_tasks';

export default function App() {
  const idCounterRef = React.useRef<number | null>(null);
  if (idCounterRef.current === null) idCounterRef.current = 1000;
  const generateId = () => String((idCounterRef.current = (idCounterRef.current || 1000) + 1));
  const [view, setView] = useState<ViewMode>('input');

  // --- State Initialization ---
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FIXED);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: '1', title: 'チーム朝会', startTime: '09:00', endTime: '09:30', type: 'fixed' },
      { id: '2', title: 'ランチ', startTime: '12:00', endTime: '13:00', type: 'fixed' },
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: '1', title: 'React実装', durationMinutes: 60, fun: 5, kind: 'must', type: 'task' },
      { id: '2', title: 'カフェでお茶', durationMinutes: 30, fun: 4, kind: 'want', type: 'task' },
    ];
  });
  
  const [weekStartDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  });

  // Input States
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStart, setNewEventStart] = useState('');
  const [newEventEnd, setNewEventEnd] = useState('');
  const [newEventStartDate, setNewEventStartDate] = useState<string>('');
  const [newEventEndDate, setNewEventEndDate] = useState<string>('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState<number>(30);
  const [newTaskFun, setNewTaskFun] = useState<number>(3);
  const [newTaskKind, setNewTaskKind] = useState<'must' | 'want'>('want');
  const [newTaskDueDateTime, setNewTaskDueDateTime] = useState<string>('');
  const [allowOvernight, setAllowOvernight] = useState<boolean>(false);

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FIXED, JSON.stringify(fixedEvents));
  }, [fixedEvents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  // --- Handlers ---
  const addFixedEvent = () => {
    if (!newEventTitle || !newEventStart || !newEventEnd) return;
    const newEvent: FixedEvent = {
      id: generateId(),
      title: newEventTitle,
      startTime: newEventStart,
      endTime: newEventEnd,
      startDate: newEventStartDate || undefined,
      endDate: newEventEndDate || undefined,
      type: 'fixed',
    };
    setFixedEvents([...fixedEvents, newEvent]);
    setNewEventTitle('');
    setNewEventStart('');
    setNewEventEnd('');
    setNewEventStartDate('');
    setNewEventEndDate('');
  };

  const handleAddTask = () => {
    if (!newTaskTitle) return;
    const newTask: Task = {
      id: generateId(),
      title: newTaskTitle,
      durationMinutes: newTaskDuration,
      fun: newTaskFun,
      kind: newTaskKind,
      dueDateTime: newTaskDueDateTime || undefined,
      type: 'task',
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDuration(30);
    setNewTaskDueDateTime('');
  };

  const removeFixedEvent = (id: string) => {
    setFixedEvents(fixedEvents.filter(e => e.id !== id));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTaskCompletion = (scheduleItemId: string) => {
    setSchedule(prev => prev.map(item => {
      if (item.id === scheduleItemId && item.type === 'task') {
        return { ...item, completed: !item.completed };
      }
      return item;
    }));

    setTasks(prev => prev.map(t => {
      if (t.id === scheduleItemId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const handleResetData = () => {
    if (window.confirm('すべてのデータをリセットして初期状態に戻しますか？')) {
        localStorage.removeItem(STORAGE_KEY_FIXED);
        localStorage.removeItem(STORAGE_KEY_TASKS);
        window.location.reload();
    }
  };

  const handleGenerate = () => {
    const result = computeSchedule(fixedEvents, tasks, weekStartDate, 7, allowOvernight);
    setSchedule(result);
    setView('schedule');
  };

  // --- Logic ---
  const computeSchedule = (fixedEv: FixedEvent[], taskList: Task[], startDate: string = weekStartDate, days = 7, allowOvernightLocal = allowOvernight) => {
    const dayStartTime = allowOvernightLocal ? '00:00' : '07:00';
    const dayEndTime = allowOvernightLocal ? '23:59' : '22:00';

    const dateToAbsMinutes = (dateStr: string, timeStr: string) => {
      const dt = new Date(`${dateStr}T${timeStr}:00`);
      return Math.floor(dt.getTime() / 60000);
    };

    const absMinutesToDateTime = (abs: number) => {
      const dt = new Date(abs * 60000);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      const hh = String(dt.getHours()).padStart(2, '0');
      const mm = String(dt.getMinutes()).padStart(2, '0');
      return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}` };
    };

    const nowAbsMinutes = Math.floor(Date.now() / 60000);

    type AbsSlot = { start: number; end: number };
    const freeSlots: AbsSlot[] = [];

    const fixedPerDay = (dateStr: string) => {
      const out: Array<{ start: number; end: number; title: string; id: string }> = [];
      for (const f of fixedEv) {
        if (f.startDate) {
          const s = f.startDate;
          const e = f.endDate || s;
          if (!(dateStr >= s && dateStr <= e)) continue;
          const isStartDay = dateStr === s;
          const isEndDay = dateStr === (f.endDate || s);
          const effectiveStart = isStartDay ? f.startTime : '00:00';
          const effectiveEnd = isEndDay ? f.endTime : '23:59';
          out.push({ start: dateToAbsMinutes(dateStr, effectiveStart), end: dateToAbsMinutes(dateStr, effectiveEnd), title: f.title, id: f.id });
        } else {
          const sMin = timeToMinutes(f.startTime);
          const eMin = timeToMinutes(f.endTime);
          if (sMin <= eMin) {
            out.push({ start: dateToAbsMinutes(dateStr, f.startTime), end: dateToAbsMinutes(dateStr, f.endTime), title: f.title, id: f.id });
          } else {
            out.push({ start: dateToAbsMinutes(dateStr, '00:00'), end: dateToAbsMinutes(dateStr, f.endTime), title: f.title, id: f.id + '-early' });
            out.push({ start: dateToAbsMinutes(dateStr, f.startTime), end: dateToAbsMinutes(dateStr, '23:59'), title: f.title, id: f.id + '-late' });
          }
        }
      }
      return out;
    };

    const startBase = new Date(`${startDate}T00:00:00`);
    for (let d = 0; d < days; d++) {
      const dayDate = new Date(startBase.getTime() + d * 24 * 60 * 60000);
      const y = dayDate.getFullYear();
      const m = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dd = String(dayDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dd}`;

      let dayStart = dateToAbsMinutes(dateStr, dayStartTime);
      const dayEnd = dateToAbsMinutes(dateStr, dayEndTime);

      if (dayStart < nowAbsMinutes) {
        dayStart = nowAbsMinutes;
      }

      const fixedThisDay = fixedPerDay(dateStr).sort((a,b)=>a.start-b.start);

      let cursor = dayStart;
      for (const f of fixedThisDay) {
        const s = Math.max(f.start, dayStart);
        const e = Math.min(f.end, dayEnd);
        if (e <= s) continue;
        if (s > cursor) freeSlots.push({ start: cursor, end: s });
        cursor = Math.max(cursor, e);
      }
      if (cursor < dayEnd) freeSlots.push({ start: cursor, end: dayEnd });
    }

    const result: ScheduleItem[] = [];
    
    // Fixed Events
    for (let d = 0; d < days; d++) {
      const dayDate = new Date(new Date(`${startDate}T00:00:00`).getTime() + d * 24 * 60 * 60000);
      const y = dayDate.getFullYear();
      const m = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dd = String(dayDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dd}`;
      
      const dayFixed = fixedPerDay(dateStr);
      for(const f of dayFixed) {
          const startDT = absMinutesToDateTime(f.start);
          const endDT = absMinutesToDateTime(f.end);
          if(startDT.date === dateStr) { 
             result.push({
               id: f.id,
               date: dateStr,
               timeRange: `${startDT.time} - ${endDT.time}`,
               title: f.title,
               type: 'fixed',
               duration: f.end - f.start
             });
          }
      }
    }

    // Tasks (DP)
    freeSlots.sort((a, b) => a.start - b.start);
    const items = taskList.map((t, idx) => ({ ...t, idx }));
    const remainingIdx = new Set(items.map(it => it.idx));

    const dateTimeToAbsMinutes = (dtStr: string) => {
        const normalized = dtStr.includes('T') ? dtStr : dtStr.replace(' ', 'T');
        return Math.floor(new Date(normalized + ':00').getTime() / 60000);
    };

    for (let si = 0; si < freeSlots.length; si++) {
      const slot = freeSlots[si];
      let capSlot = slot.end - slot.start;
      if (capSlot <= 0) continue;

      const cand: { idx: number; w: number; v: number; task: Task }[] = [];
      for (const it of items) {
        if (!remainingIdx.has(it.idx)) continue;
        const w = it.durationMinutes; 
        if (w > capSlot) continue;
        
        if (it.dueDateTime) {
            const dueAbs = dateTimeToAbsMinutes(it.dueDateTime);
            if (slot.start + w > dueAbs) continue;
        }
        
        const v = it.kind === 'must' ? 1000 : it.fun;
        cand.push({ idx: it.idx, w, v, task: it });
      }
      if (cand.length === 0) continue;

      const m = cand.length;
      const C = Math.floor(capSlot);
      const dp = Array.from({ length: m + 1 }, () => new Array<number>(C + 1).fill(0));
      const take = Array.from({ length: m + 1 }, () => new Array<boolean>(C + 1).fill(false));

      for (let i = 1; i <= m; i++) {
        const { w, v } = cand[i - 1];
        for (let c = 0; c <= C; c++) {
          dp[i][c] = dp[i - 1][c];
          if (c >= w) {
            const val = dp[i - 1][c - w] + v;
            if (val > dp[i][c]) {
              dp[i][c] = val;
              take[i][c] = true;
            }
          }
        }
      }

      let c = C;
      const picked: number[] = [];
      for (let i = m; i >= 1; i--) {
        if (take[i][c]) {
          const itm = cand[i - 1];
          picked.push(i - 1);
          c -= itm.w;
        }
      }
      if (picked.length === 0) continue;
      
      picked.sort((a, b) => {
        const A = cand[a].task;
        const B = cand[b].task;
        if (A.kind !== B.kind) return A.kind === 'must' ? -1 : 1;
        return B.fun - A.fun;
      });

      let cursor = slot.start;
      for (const pIdx of picked) {
        const chosen = cand[pIdx];
        const startAbs = cursor;
        const endAbs = cursor + chosen.w;
        const startDT = absMinutesToDateTime(startAbs);
        const endDT = absMinutesToDateTime(endAbs);
        
        result.push({ 
          id: `${chosen.task.id}`, 
          date: startDT.date,
          timeRange: `${startDT.time} - ${endDT.time}`, 
          title: chosen.task.title, 
          type: 'task', 
          duration: chosen.w, 
          fun: chosen.task.fun, 
          kind: chosen.task.kind,
          completed: chosen.task.completed,
          dueDateTime: chosen.task.dueDateTime
        });
        cursor = endAbs;
        remainingIdx.delete(chosen.idx);
      }
      freeSlots[si].start = cursor;
    }

    return result;
  };

  // --- Grid View Helpers ---
  const GRID_START_HOUR = 0; 
  const GRID_END_HOUR = 24;  
  const TOTAL_GRID_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;

  const getPositionStyle = (timeRange: string) => {
    const [startStr, endStr] = timeRange.split(' - ');
    const startMin = timeToMinutes(startStr);
    const endMin = timeToMinutes(endStr);
    
    const startOffset = startMin - (GRID_START_HOUR * 60);
    const duration = endMin - startMin;

    const topPercent = (startOffset / TOTAL_GRID_MINUTES) * 100;
    const heightPercent = (duration / TOTAL_GRID_MINUTES) * 100;

    return {
      top: `${Math.max(0, topPercent)}%`,
      height: `${heightPercent}%`,
    };
  };

  const getDaysArray = () => {
    const days = [];
    const start = new Date(weekStartDate);
    for(let i=0; i<7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push({
            dateStr: d.toISOString().slice(0,10),
            dayName: d.toLocaleDateString('ja-JP', { weekday: 'short' }),
            dayNum: d.getDate()
        });
    }
    return days;
  };

  const getItemStyleClass = (item: ScheduleItem) => {
    if (item.type === 'fixed') return 'bg-stone-200 border-stone-300 text-stone-600 rounded-lg shadow-sm';
    
    if (item.completed) {
      return 'bg-gray-100 border-gray-300 text-gray-400 border-dashed rounded-xl opacity-80 line-through grayscale';
    }

    if (item.kind === 'must') return 'bg-rose-300 border-rose-400 text-white shadow-md shadow-rose-200 rounded-xl hover:scale-[1.02] hover:z-30 transition-transform';
    
    return 'bg-sky-300 border-sky-400 text-white shadow-md shadow-sky-200 rounded-xl hover:scale-[1.02] hover:z-30 transition-transform';
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFDF7] text-stone-700 font-sans pb-12">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-pink-100">
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between ${view === 'schedule' ? 'max-w-full' : 'max-w-7xl'}`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-400 fill-pink-100" />
            <h1 className="text-xl font-bold tracking-wider text-stone-800">
              <span className="text-pink-500">AI</span> Scheduler
            </h1>
          </div>
          <nav className="flex space-x-2 bg-pink-50 p-1.5 rounded-full border border-pink-100">
            <button 
              onClick={() => setView('input')} 
              className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all ${
                view === 'input' 
                  ? 'bg-white text-pink-500 shadow-md shadow-pink-100' 
                  : 'text-stone-400 hover:text-pink-400'
              }`}
            >
              入力
            </button>
            <button 
              onClick={() => schedule.length > 0 && setView('schedule')} 
              className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all ${
                view === 'schedule' 
                  ? 'bg-white text-pink-500 shadow-md shadow-pink-100' 
                  : 'text-stone-400 hover:text-pink-400'
              }`}
            >
              カレンダー
            </button>
          </nav>
        </div>
      </header>

      <main className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 ${view === 'schedule' ? 'max-w-full' : 'max-w-7xl'}`}>
        {view === 'input' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in">
            {/* 左カラム: 固定予定 */}
            <div className="space-y-6">
              <section className="bg-white rounded-3xl shadow-xl shadow-stone-100/50 border-4 border-white p-6">
                <div className="flex items-center gap-2 mb-6 border-b-2 border-dashed border-stone-100 pb-3">
                  <div className="bg-stone-100 p-2 rounded-full">
                    <Calendar className="w-5 h-5 text-stone-500" />
                  </div>
                  <h2 className="text-lg font-bold text-stone-700">1. 決まっている予定</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 mb-1 ml-1">開始日</label>
                      <input type="date" value={newEventStartDate} onChange={(e) => setNewEventStartDate(e.target.value)} className="w-full rounded-2xl border-2 border-stone-100 px-3 py-2 text-sm focus:border-pink-300 focus:ring-0 text-stone-600 bg-stone-50/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 mb-1 ml-1">終了日</label>
                      <input type="date" value={newEventEndDate} onChange={(e) => setNewEventEndDate(e.target.value)} className="w-full rounded-2xl border-2 border-stone-100 px-3 py-2 text-sm focus:border-pink-300 focus:ring-0 text-stone-600 bg-stone-50/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 mb-1 ml-1">開始</label>
                      <input type="time" value={newEventStart} onChange={(e) => setNewEventStart(e.target.value)} className="w-full rounded-2xl border-2 border-stone-100 px-3 py-2 text-sm focus:border-pink-300 focus:ring-0 text-stone-600 bg-stone-50/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 mb-1 ml-1">終了</label>
                      <input type="time" value={newEventEnd} onChange={(e) => setNewEventEnd(e.target.value)} className="w-full rounded-2xl border-2 border-stone-100 px-3 py-2 text-sm focus:border-pink-300 focus:ring-0 text-stone-600 bg-stone-50/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 mb-1 ml-1">予定名</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="例: ランチ" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} className="flex-1 rounded-2xl border-2 border-stone-100 px-4 py-2 text-sm focus:border-pink-300 focus:ring-0 bg-stone-50/50 placeholder-stone-300" />
                      <button onClick={addFixedEvent} className="bg-stone-200 text-stone-600 p-2.5 rounded-2xl hover:bg-stone-300 transition-colors shadow-sm"><Plus className="w-6 h-6" /></button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  {fixedEvents.map((event) => (
                    <div key={event.id} className="group flex items-center justify-between bg-stone-50 p-3 rounded-2xl border-2 border-transparent hover:border-stone-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-stone-500 shadow-sm">
                           {event.startDate ? <span className="mr-1">{event.startDate.slice(5)}{event.endDate && event.endDate !== event.startDate ? `~${event.endDate.slice(5)}` : ''}</span> : null}
                           {event.startTime}-{event.endTime}
                        </div>
                        <span className="text-sm font-bold text-stone-700">{event.title}</span>
                      </div>
                      <button onClick={() => removeFixedEvent(event.id)} className="text-stone-300 hover:text-rose-400"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* 右カラム: タスク */}
            <div className="space-y-6">
              <section className="bg-white rounded-3xl shadow-xl shadow-pink-100/50 border-4 border-white p-6">
                <div className="flex items-center gap-2 mb-6 border-b-2 border-dashed border-pink-100 pb-3">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                  </div>
                  <h2 className="text-lg font-bold text-stone-700">2. やりたいタスク</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-pink-300 mb-1 ml-1">タスク名</label>
                    <input type="text" placeholder="例: カフェに行く" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="w-full rounded-2xl border-2 border-pink-100 px-4 py-2 text-sm focus:border-pink-300 focus:ring-0 bg-pink-50/30 placeholder-pink-200" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-pink-300 mb-1 ml-1">期限 (任意)</label>
                    <input 
                      type="datetime-local" 
                      value={newTaskDueDateTime} 
                      onChange={(e) => setNewTaskDueDateTime(e.target.value)} 
                      className="w-full rounded-2xl border-2 border-pink-100 px-3 py-2 text-sm text-stone-600 bg-pink-50/30 focus:border-pink-300 focus:ring-0" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-xs font-bold text-pink-300 mb-1 ml-1">所要時間</label>
                       <select value={newTaskDuration} onChange={(e) => setNewTaskDuration(Number(e.target.value))} className="w-full rounded-2xl border-2 border-pink-100 px-3 py-2 text-sm text-stone-600 bg-pink-50/30 focus:border-pink-300 focus:ring-0">
                        <option value={30}>30分</option>
                        <option value={60}>60分</option>
                        <option value={90}>90分</option>
                        <option value={120}>120分</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-pink-300 mb-1 ml-1">種類</label>
                       <select value={newTaskKind} onChange={(e) => setNewTaskKind(e.target.value as 'must' | 'want')} className="w-full rounded-2xl border-2 border-pink-100 px-3 py-2 text-sm text-stone-600 bg-pink-50/30 focus:border-pink-300 focus:ring-0">
                        <option value="want">やりたい (Want)</option>
                        <option value="must">必須 (Must)</option>
                       </select>
                    </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-pink-300 mb-1 ml-1">楽しさ</label>
                     <div className="flex justify-between bg-pink-50/30 rounded-2xl p-2 border-2 border-pink-100">
                        {[1, 2, 3, 4, 5].map((val) => (
                           <button 
                             key={val} 
                             onClick={() => setNewTaskFun(val)}
                             className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                newTaskFun === val 
                                ? 'bg-pink-400 text-white shadow-md transform scale-110' 
                                : 'text-pink-300 hover:bg-pink-200 hover:text-white'
                             }`}
                           >
                             {val}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button onClick={handleAddTask} className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 rounded-full shadow-[0_4px_0_0_rgba(244,114,182,0.5)] active:shadow-none active:translate-y-1 transition-all">
                    <Plus className="w-5 h-5" /> 追加する！
                  </button>
                </div>

                <div className="mt-6 space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="group flex flex-col bg-white p-3 rounded-2xl border-2 border-pink-50 hover:border-pink-200 transition-all gap-1 shadow-sm">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             {task.completed ? (
                               <span className="text-xs bg-stone-100 text-stone-400 px-2 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> 完了</span>
                             ) : (
                               <span className={`text-xs px-2 py-1 rounded-full font-bold text-white ${task.kind === 'must' ? 'bg-rose-400' : 'bg-sky-400'}`}>{task.kind === 'must' ? 'Must' : 'Want'}</span>
                             )}
                             <span className={`text-sm font-bold ${task.completed ? 'line-through text-stone-300' : 'text-stone-700'}`}>{task.title}</span>
                         </div>
                         <button onClick={() => removeTask(task.id)} className="text-stone-300 hover:text-rose-400"><Trash2 className="w-5 h-5" /></button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400 pl-1 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.durationMinutes}分</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {task.fun}</span>
                          {task.dueDateTime && (
                              <span className="text-rose-400 font-bold ml-auto">締切: {formatDateTime(task.dueDateTime)}</span>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="text-center">
                <button onClick={handleGenerate} className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold text-lg rounded-full shadow-[0_6px_0_0_rgba(139,92,246,0.5)] active:shadow-none active:translate-y-1.5 transition-all flex items-center justify-center gap-3 mx-auto">
                  <Sparkles className="w-6 h-6" /> スケジュールを作る
                </button>
              </div>

               <div className="text-center mt-6">
                  <button onClick={handleResetData} className="text-xs text-stone-400 hover:text-rose-400 underline flex items-center justify-center gap-1 mx-auto">
                      <RotateCcw className="w-3 h-3" /> リセット
                  </button>
               </div>
            </div>
          </div>
        ) : (
          <div className="animate-in bg-white/50 backdrop-blur-sm rounded-[2.5rem] shadow-2xl shadow-pink-100 border-4 border-white flex flex-col h-[1200px] overflow-hidden">
            {/* カレンダーヘッダー */}
            <div className="flex border-b border-pink-100 bg-white/80">
              <div className="w-16 flex-shrink-0 border-r border-pink-100"></div> 
              <div className="flex-1 grid grid-cols-7 divide-x divide-pink-50">
                {getDaysArray().map((day, i) => (
                   <div key={i} className={`p-3 text-center ${day.dateStr === weekStartDate ? 'bg-pink-50/50' : ''}`}>
                     <div className="text-xs text-pink-400 font-bold uppercase tracking-wider">{day.dayName}</div>
                     <div className={`text-lg font-black ${day.dateStr === weekStartDate ? 'text-pink-500' : 'text-stone-600'}`}>{day.dayNum}</div>
                   </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto relative bg-[#FFFDF7] custom-scrollbar">
               {/* 内部高さを1800pxに拡張して30分枠を見やすく */}
               <div className="flex min-h-[1800px]">
                 {/* 時間軸 */}
                 <div className="w-16 flex-shrink-0 border-r border-pink-100 relative bg-white/50">
                    {Array.from({length: GRID_END_HOUR - GRID_START_HOUR + 1}).map((_, i) => (
                        <div key={i} className="absolute w-full text-right pr-3 text-xs font-bold text-pink-300" style={{ top: `${(i / (GRID_END_HOUR - GRID_START_HOUR)) * 100}%`, transform: 'translateY(-50%)' }}>
                            {(GRID_START_HOUR + i).toString().padStart(2, '0')}
                        </div>
                    ))}
                 </div>
                 {/* メイングリッド */}
                 <div className="flex-1 grid grid-cols-7 divide-x divide-pink-50 relative">
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {Array.from({length: GRID_END_HOUR - GRID_START_HOUR}).map((_, i) => (
                             <div key={i} className="border-t border-pink-50 w-full absolute" style={{ top: `${(i / (GRID_END_HOUR - GRID_START_HOUR)) * 100}%` }}></div>
                        ))}
                    </div>

                    {getDaysArray().map((day, colIndex) => {
                        const dayItems = schedule.filter(item => item.date === day.dateStr);
                        return (
                            <div key={colIndex} className="relative h-full z-10 hover:bg-white/50 transition-colors">
                                {dayItems.map((item) => {
                                    const style = getPositionStyle(item.timeRange);
                                    const classNames = getItemStyleClass(item);
                                    
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => item.type === 'task' && toggleTaskCompletion(item.id)}
                                            className={`absolute inset-x-1 p-2 overflow-hidden cursor-pointer flex flex-col justify-center ${classNames}`}
                                            style={style}
                                            title={`${item.title} (${item.timeRange})${item.dueDateTime ? `\n締切: ${formatDateTime(item.dueDateTime)}` : ''}`}
                                        >
                                            <div className="font-bold text-sm truncate leading-tight flex items-center gap-1">
                                                {item.completed && <Check className="w-4 h-4" />}
                                                <span className="truncate">{item.title}</span>
                                            </div>
                                            {item.type !== 'break' && (
                                              <div className="opacity-80 text-[10px] font-bold mt-0.5 truncate">{item.timeRange}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                 </div>
               </div>
            </div>

            <div className="p-4 bg-white border-t border-pink-100 flex justify-between items-center">
               <div className="text-xs font-bold text-pink-300">範囲: {GRID_START_HOUR}:00 - {GRID_END_HOUR}:00</div>
               <button onClick={() => setView('input')} className="text-sm font-bold text-stone-500 hover:text-pink-500 flex items-center gap-2 transition-colors"><ArrowLeft className="w-5 h-5" /> 設定に戻る</button>
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        body {
          background-color: #FFFDF7;
        }
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #FFFDF7; 
        }
        ::-webkit-scrollbar-thumb {
          background: #FBCFE8; 
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #F472B6; 
        }
      `}</style>
    </div>
  );
}