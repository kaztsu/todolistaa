import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, CheckCircle, Brain, Coffee, Layout, List, ArrowLeft, RotateCcw, Check } from 'lucide-react';

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
  completed?: boolean; // ★追加: タスクの完了状態
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
  completed?: boolean; // ★追加: 表示用アイテムの完了状態
}

// --- Helper Functions ---
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// LocalStorage Keys
const STORAGE_KEY_FIXED = 'ai_scheduler_fixed_events';
const STORAGE_KEY_TASKS = 'ai_scheduler_tasks';

export default function App() {
  const idCounterRef = React.useRef<number | null>(null);
  if (idCounterRef.current === null) idCounterRef.current = 1000;
  const generateId = () => String((idCounterRef.current = (idCounterRef.current || 1000) + 1));
  const [view, setView] = useState<ViewMode>('input');

  // --- State Initialization (with LocalStorage) ---
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FIXED);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: '1', title: 'チーム朝会', startTime: '09:00', endTime: '09:30', type: 'fixed' },
      { id: '2', title: '昼休憩', startTime: '12:00', endTime: '13:00', type: 'fixed' },
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: '1', title: 'React実装', durationMinutes: 60, fun: 5, kind: 'must', type: 'task' },
      { id: '2', title: 'メール返信', durationMinutes: 30, fun: 2, kind: 'want', type: 'task' },
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
      completed: false, // 初期状態は未完了
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

  // ★追加: タスクの完了状態を切り替える関数
  const toggleTaskCompletion = (scheduleItemId: string) => {
    // 1. カレンダー表示（Schedule）を即座に更新
    setSchedule(prev => prev.map(item => {
      if (item.id === scheduleItemId && item.type === 'task') {
        return { ...item, completed: !item.completed };
      }
      return item;
    }));

    // 2. 元データ（Tasks）も更新して保存する
    // ※今回は「scheduleItemId」が「taskId」と同じになるように実装しているのでそのまま検索
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

      const dayStart = dateToAbsMinutes(dateStr, dayStartTime);
      const dayEnd = dateToAbsMinutes(dateStr, dayEndTime);

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
          completed: chosen.task.completed // ★重要: 計算時に完了状態を引き継ぐ
        });
        cursor = endAbs;
        remainingIdx.delete(chosen.idx);
      }
      freeSlots[si].start = cursor;
    }

    return result;
  };

  // --- Grid View Helpers ---
  const GRID_START_HOUR = 6; 
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

  // カレンダーアイテムの色を決定するヘルパー
  const getItemStyleClass = (item: ScheduleItem) => {
    if (item.type === 'fixed') return 'bg-gray-200 border-gray-300 text-gray-700';
    if (item.type === 'break') return 'bg-amber-100 border-amber-200 text-amber-800 opacity-70';
    
    // 完了済みタスクのスタイル
    if (item.completed) {
      return 'bg-gray-400 border-gray-500 text-white line-through opacity-80';
    }

    // 未完了タスク
    if (item.kind === 'must') return 'bg-red-100 border-red-200 text-red-800 hover:bg-red-200';
    return 'bg-teal-100 border-teal-200 text-teal-800 hover:bg-teal-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">AI Scheduler</h1>
          </div>
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setView('input')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'input' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>入力・設定</button>
            <button onClick={() => schedule.length > 0 && setView('schedule')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>カレンダー</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'input' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in">
            {/* Input Left: Fixed Events */}
            <div className="space-y-6">
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-gray-800">1. 決まっている予定</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">開始日 (省略で毎日)</label>
                      <input type="date" value={newEventStartDate} onChange={(e) => setNewEventStartDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">終了日 (省略で同日)</label>
                      <input type="date" value={newEventEndDate} onChange={(e) => setNewEventEndDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">開始時刻</label>
                      <input type="time" value={newEventStart} onChange={(e) => setNewEventStart(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">終了時刻</label>
                      <input type="time" value={newEventEnd} onChange={(e) => setNewEventEnd(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">予定名</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="例: ミーティング" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                      <button onClick={addFixedEvent} className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100"><Plus className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  {fixedEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-white px-2 py-1 rounded text-xs font-mono border text-gray-600">
                           {event.startDate ? <span className="mr-1">{event.startDate.slice(5)}{event.endDate && event.endDate !== event.startDate ? `~${event.endDate.slice(5)}` : ''}</span> : null}
                           {event.startTime}-{event.endTime}
                        </div>
                        <span className="text-sm font-medium">{event.title}</span>
                      </div>
                      <button onClick={() => removeFixedEvent(event.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Input Right: Tasks */}
            <div className="space-y-6">
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <List className="w-5 h-5 text-teal-500" />
                  <h2 className="text-lg font-semibold text-gray-800">2. やりたいタスク</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">タスク名</label>
                    <input type="text" placeholder="例: レポート作成" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">所要時間</label>
                       <select value={newTaskDuration} onChange={(e) => setNewTaskDuration(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm">
                        <option value={30}>30分</option>
                        <option value={60}>60分</option>
                        <option value={90}>90分</option>
                        <option value={120}>120分</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">種類</label>
                       <select value={newTaskKind} onChange={(e) => setNewTaskKind(e.target.value as 'must' | 'want')} className="w-full rounded-lg border px-3 py-2 text-sm">
                        <option value="want">やりたい (Want)</option>
                        <option value="must">必須 (Must)</option>
                       </select>
                    </div>
                  </div>

                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">楽しさ (1-5)</label>
                     <select value={newTaskFun} onChange={(e) => setNewTaskFun(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm">
                        <option value={5}>5: とても楽しい</option>
                        <option value={4}>4: 楽しい</option>
                        <option value={3}>3: 普通</option>
                        <option value={2}>2: 微妙</option>
                        <option value={1}>1: 楽しくない</option>
                     </select>
                  </div>

                  <button onClick={handleAddTask} className="w-full flex items-center justify-center gap-2 bg-teal-50 text-teal-600 font-medium py-2 rounded-lg border border-teal-100">
                    <Plus className="w-4 h-4" /> タスクを追加
                  </button>
                </div>

                <div className="mt-6 space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="flex items-center gap-2">
                         {/* 完了状態を表示（リスト側） */}
                         {task.completed ? (
                           <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3"/> 完了</span>
                         ) : (
                           <span className={`text-xs px-1.5 py-0.5 rounded ${task.kind === 'must' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'}`}>{task.kind === 'must' ? 'Must' : 'Want'}</span>
                         )}
                         <span className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                         <span className="text-xs text-gray-400">({task.durationMinutes}分 / ★{task.fun})</span>
                      </div>
                      <button onClick={() => removeTask(task.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="bg-indigo-50 rounded-xl p-6 text-center border border-indigo-100">
                <button onClick={handleGenerate} className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-md flex items-center justify-center gap-2">
                  <Brain className="w-5 h-5" /> スケジュールを計画する
                </button>
              </div>

               <div className="text-center mt-8">
                  <button onClick={handleResetData} className="text-xs text-gray-400 hover:text-red-500 underline flex items-center justify-center gap-1 mx-auto">
                      <RotateCcw className="w-3 h-3" /> データをすべてリセット
                  </button>
               </div>
            </div>
          </div>
        ) : (
          <div className="animate-in bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[800px]">
            <div className="flex border-b border-gray-200">
              <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-200"></div> 
              <div className="flex-1 grid grid-cols-7 divide-x divide-gray-200">
                {getDaysArray().map((day, i) => (
                   <div key={i} className={`p-2 text-center ${day.dateStr === weekStartDate ? 'bg-indigo-50' : 'bg-white'}`}>
                     <div className="text-xs text-gray-500 font-medium uppercase">{day.dayName}</div>
                     <div className={`text-sm font-bold ${day.dateStr === weekStartDate ? 'text-indigo-600' : 'text-gray-900'}`}>{day.dayNum}</div>
                   </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto relative">
               <div className="flex min-h-[1000px]">
                 <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-200 relative">
                    {Array.from({length: GRID_END_HOUR - GRID_START_HOUR + 1}).map((_, i) => (
                        <div key={i} className="absolute w-full text-right pr-2 text-xs text-gray-400 font-mono" style={{ top: `${(i / (GRID_END_HOUR - GRID_START_HOUR)) * 100}%`, transform: 'translateY(-50%)' }}>
                            {(GRID_START_HOUR + i).toString().padStart(2, '0')}:00
                        </div>
                    ))}
                 </div>
                 <div className="flex-1 grid grid-cols-7 divide-x divide-gray-200 relative">
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {Array.from({length: GRID_END_HOUR - GRID_START_HOUR}).map((_, i) => (
                             <div key={i} className="border-t border-gray-100 w-full absolute" style={{ top: `${(i / (GRID_END_HOUR - GRID_START_HOUR)) * 100}%` }}></div>
                        ))}
                    </div>

                    {getDaysArray().map((day, colIndex) => {
                        const dayItems = schedule.filter(item => item.date === day.dateStr);
                        return (
                            <div key={colIndex} className="relative h-full z-10 hover:bg-gray-50/50 transition-colors">
                                {dayItems.map((item) => {
                                    const style = getPositionStyle(item.timeRange);
                                    const classNames = getItemStyleClass(item);
                                    
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => item.type === 'task' && toggleTaskCompletion(item.id)}
                                            className={`absolute inset-x-1 p-1 rounded border text-xs overflow-hidden shadow-sm hover:z-20 hover:shadow-md transition-all cursor-pointer flex flex-col ${classNames}`}
                                            style={style}
                                            title={`${item.title} (${item.timeRange})`}
                                        >
                                            <div className="font-bold truncate leading-tight flex items-center justify-between">
                                                <span>{item.title}</span>
                                                {item.completed && <Check className="w-3 h-3" />}
                                            </div>
                                            {item.type !== 'break' && <div className="opacity-75 text-[10px] truncate">{item.timeRange}</div>}
                                            {item.type === 'task' && item.fun && !item.completed && <div className="absolute bottom-1 right-1 opacity-50">★{item.fun}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                 </div>
               </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
               <div className="text-xs text-gray-500">表示範囲: {GRID_START_HOUR}:00 - {GRID_END_HOUR}:00</div>
               <button onClick={() => setView('input')} className="text-sm font-medium text-indigo-600 flex items-center gap-1 hover:text-indigo-800"><ArrowLeft className="w-4 h-4" /> 設定に戻る</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}