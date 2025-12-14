import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, CheckCircle, Brain, Coffee, Layout, List } from 'lucide-react';
type ViewMode = 'input' | 'schedule';

interface FixedEvent {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  startDate?: string; // optional start date YYYY-MM-DD
  endDate?: string; // optional end date YYYY-MM-DD (if omitted, same as startDate)
  type: 'fixed';
}

interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  fun: number; // 1-5 scale
  kind: 'must' | 'want'; // 'must' = やらなければいけないこと, 'want' = やりたいこと
  dueDateTime?: string;
  type: 'task';
}

interface ScheduleItem {
  id: string;
  timeRange: string;
  title: string;
  type: 'fixed' | 'task' | 'break';
  duration: number;
  fun?: number;
  kind?: 'must' | 'want';
}

// --- Helper Functions ---
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// minutesToTime ヘルパーは未使用のため削除

export default function App() {
  // Date.now() の使用を避けるための安定した連番IDジェネレータ
  // モジュールスコープのカウンタは HMR（ホットリロード）中も持続します
  const idCounterRef = React.useRef<number | null>(null);
  if (idCounterRef.current === null) idCounterRef.current = 1000;
  const generateId = () => String((idCounterRef.current = (idCounterRef.current || 1000) + 1));
  const [view, setView] = useState<ViewMode>('input');

  // 初期状態
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([
    { id: '1', title: 'チーム朝会', startTime: '09:00', endTime: '09:30', type: 'fixed' },
    { id: '2', title: '昼休憩', startTime: '12:00', endTime: '13:00', type: 'fixed' },
  ]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Reactコンポーネント実装', durationMinutes: 60, fun: 5, kind: 'must', type: 'task' },
    { id: '2', title: 'メール返信', durationMinutes: 30, fun: 2, kind: 'want', type: 'task' },
  ]);
  const [weekStartDate] = useState<string>(() => new Date().toISOString().slice(0,10));

  // 入力状態
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

  // 結果状態 — デザインプレビューに合わせてモック初期値を設定
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: 's1', timeRange: '09:00 - 09:30', title: 'チーム朝会', type: 'fixed', duration: 30 },
    { id: 's2', timeRange: '09:30 - 10:30', title: 'Reactコンポーネント実装', type: 'task', duration: 60, fun: 5 },
    { id: 's3', timeRange: '10:30 - 10:45', title: '休憩 / バッファ', type: 'break', duration: 15 },
    { id: 's4', timeRange: '10:45 - 11:15', title: 'メール返信', type: 'task', duration: 30, fun: 2 },
    { id: 's5', timeRange: '12:00 - 13:00', title: '昼休憩', type: 'fixed', duration: 60 },
  ]);

  // --- ハンドラ ---
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
    if (view === 'schedule') {
      const newFixed = [...fixedEvents, newEvent];
      setSchedule(computeSchedule(newFixed, tasks, weekStartDate, 7, allowOvernight));
    }
  };

  const addTask = () => {
    if (!newTaskTitle) return;
    const newTask: Task = {
      id: generateId(),
      title: newTaskTitle,
      durationMinutes: newTaskDuration,
      fun: newTaskFun,
      kind: newTaskKind,
      dueDateTime: newTaskDueDateTime || undefined,
      type: 'task',
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDuration(30);
    setNewTaskDueDateTime('');
    if (view === 'schedule') {
      const newTasks = [...tasks, newTask];
      setSchedule(computeSchedule(fixedEvents, newTasks, weekStartDate, 7, allowOvernight));
    }
  };

  const removeFixedEvent = (id: string) => {
    const newFixed = fixedEvents.filter(e => e.id !== id);
    setFixedEvents(newFixed);
    if (view === 'schedule') setSchedule(computeSchedule(newFixed, tasks, weekStartDate, 7));
  };

  const removeTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    if (view === 'schedule') setSchedule(computeSchedule(fixedEvents, newTasks, weekStartDate, 7));
  };

  // --- ロジック実装 ---
  const handleGenerate = () => {
    const result = computeSchedule(fixedEvents, tasks, weekStartDate, 7, allowOvernight);
    setSchedule(result);
    setView('schedule');
  };

  // 指定開始日（YYYY-MM-DD）から始まる1週間分のスケジュールを計算
  const computeSchedule = (fixedEv: FixedEvent[], taskList: Task[], startDate: string = weekStartDate, days = 7, allowOvernightLocal = allowOvernight) => {
    const dayStartTime = allowOvernightLocal ? '00:00' : '08:00';
    const dayEndTime = allowOvernightLocal ? '23:59' : '20:00';

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

    // 週全体の空きスロットを、絶対分（分単位のタイムスタンプ）で構築
    type AbsSlot = { start: number; end: number };
    const freeSlots: AbsSlot[] = [];

    const fixedPerDay = (dateStr: string) => {
      const out: Array<{ start: number; end: number; title: string; id: string }> = [];
      for (const f of fixedEv) {
        // この日付にイベントが適用されるか判定（startDate が無い場合は毎日繰り返し）
        if (f.startDate) {
          const s = f.startDate;
          const e = f.endDate || s;
          if (!(dateStr >= s && dateStr <= e)) continue;
          // 複数日に渡る予定の場合：この日付における有効な開始／終了時刻を決定
          const isStartDay = dateStr === s;
          const isEndDay = dateStr === (f.endDate || s);
          const effectiveStart = isStartDay ? f.startTime : '00:00';
          const effectiveEnd = isEndDay ? f.endTime : '23:59';
          out.push({ start: dateToAbsMinutes(dateStr, effectiveStart), end: dateToAbsMinutes(dateStr, effectiveEnd), title: f.title, id: f.id });
        } else {
          // 毎日繰り返す予定
          const sMin = timeToMinutes(f.startTime);
          const eMin = timeToMinutes(f.endTime);
          if (sMin <= eMin) {
            // 同一日内に完結する通常の繰り返し
            out.push({ start: dateToAbsMinutes(dateStr, f.startTime), end: dateToAbsMinutes(dateStr, f.endTime), title: f.title, id: f.id });
          } else {
            // overnight recurring: add two segments for each date
            // early segment (00:00 - endTime)
            out.push({ start: dateToAbsMinutes(dateStr, '00:00'), end: dateToAbsMinutes(dateStr, f.endTime), title: f.title, id: f.id + '-early' });
            // late segment (startTime - 23:59)
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

    // result initially contains all fixed events expanded with dates
    const result: ScheduleItem[] = [];
    for (let d = 0; d < days; d++) {
      const dayDate = new Date(new Date(`${startDate}T00:00:00`).getTime() + d * 24 * 60 * 60000);
      const y = dayDate.getFullYear();
      const m = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dd = String(dayDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dd}`;
      for (const f of fixedEv) {
        if (f.startDate) {
          const s = f.startDate;
          const e = f.endDate || s;
          if (!(dateStr >= s && dateStr <= e)) continue;
          const sDate = f.startDate;
          const eDate = f.endDate;
          const effectiveStart = sDate && dateStr === sDate ? f.startTime : '00:00';
          const effectiveEnd = eDate && dateStr === eDate ? f.endTime : '23:59';
          result.push({ id: `${dateStr}-${f.id}`, timeRange: `${dateStr} ${effectiveStart} - ${effectiveEnd}`, title: f.title, type: 'fixed', duration: Math.max(0, timeToMinutes(effectiveEnd) - timeToMinutes(effectiveStart)) });
        } else {
          // recurring daily
          const sMin = timeToMinutes(f.startTime);
          const eMin = timeToMinutes(f.endTime);
          if (sMin <= eMin) {
            result.push({ id: `${dateStr}-${f.id}`, timeRange: `${dateStr} ${f.startTime} - ${f.endTime}`, title: f.title, type: 'fixed', duration: timeToMinutes(f.endTime) - timeToMinutes(f.startTime) });
          } else {
            // overnight recurring: two entries
            result.push({ id: `${dateStr}-${f.id}-early`, timeRange: `${dateStr} 00:00 - ${f.endTime}`, title: f.title, type: 'fixed', duration: timeToMinutes(f.endTime) - timeToMinutes('00:00') });
            result.push({ id: `${dateStr}-${f.id}-late`, timeRange: `${dateStr} ${f.startTime} - 23:59`, title: f.title, type: 'fixed', duration: timeToMinutes('23:59') - timeToMinutes(f.startTime) });
          }
        }
      }
    }

    // タスクを分割せずに割り当て：各空きスロットごとに 0/1 ナップザック DP を実行し、
    // そのスロット内で幸福度（must=1000, want=fun）を最大化するタスク集合を選択します。
    // 選択されたタスクをスロット内に順次配置し、タスクはスロット間で分割されません。
    freeSlots.sort((a, b) => a.start - b.start);
    const items = taskList.map((t, idx) => ({ ...t, idx }));
    const remainingIdx = new Set(items.map(it => it.idx));

    // dueDateTime を絶対分（分単位タイムスタンプ）に変換するヘルパー
    const dateTimeToAbsMinutes = (dtStr: string) => {
      const normalized = dtStr.includes('T') ? dtStr : dtStr.replace(' ', 'T');
      return Math.floor(new Date(normalized + ':00').getTime() / 60000);
    };

    for (let si = 0; si < freeSlots.length; si++) {
      const slot = freeSlots[si];
      let capSlot = slot.end - slot.start;
      if (capSlot <= 0) continue;

      // build arrays of candidate tasks (still remaining and fitting entirely)
      const cand: { idx: number; w: number; v: number; task: Task }[] = [];
      for (const it of items) {
        if (!remainingIdx.has(it.idx)) continue;
        const w = it.durationMinutes;
        if (w > capSlot) continue; // cannot fit entirely
        // respect dueDate: task must finish before due if specified
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
      // DP table
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

      // backtrack to find selected tasks for this slot
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

      // allocate picked tasks sequentially in this slot
      // sort picked by some heuristic (e.g., must first then by fun desc)
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
        result.push({ id: `${chosen.task.id}`, timeRange: `${startDT.date} ${startDT.time} - ${endDT.time}`, title: chosen.task.title, type: 'task', duration: chosen.w, fun: chosen.task.fun, kind: chosen.task.kind });
        cursor = endAbs;
        remainingIdx.delete(chosen.idx);
      }
      // update slot start (advance past allocated items)
      freeSlots[si].start = cursor;
    }

    // 表示のため開始時刻の絶対値でソート
    result.sort((a,b)=>{
      const aStart = Date.parse(a.timeRange.split(' ')[0] + 'T' + a.timeRange.split(' ')[1] + ':00') || 0;
      const bStart = Date.parse(b.timeRange.split(' ')[0] + 'T' + b.timeRange.split(' ')[1] + ':00') || 0;
      return aStart - bStart;
    });
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">AI Scheduler</h1>
          </div>
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView('input')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                view === 'input' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              入力・設定
            </button>
            <button
              onClick={() => setView('schedule')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                view === 'schedule' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              スケジュール結果
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'input' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {/* Left Column: Fixed Events */}
            <div className="space-y-6">
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-gray-800">1. 決まっている予定</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">開始</label>
                      <input 
                        type="time" 
                        value={newEventStart}
                        onChange={(e) => setNewEventStart(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">終了</label>
                      <input 
                        type="time" 
                        value={newEventEnd}
                        onChange={(e) => setNewEventEnd(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">開始日（省略で毎日）</label>
                      <input
                        type="date"
                        value={newEventStartDate}
                        onChange={(e) => setNewEventStartDate(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">終了日（省略で同日）</label>
                      <input
                        type="date"
                        value={newEventEndDate}
                        onChange={(e) => setNewEventEndDate(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">予定名</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="例: ミーティング、ランチ" 
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="flex-1 rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                      <button 
                        onClick={addFixedEvent}
                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* List of Fixed Events */}
                <div className="mt-6 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">登録済みリスト</h3>
                  {fixedEvents.length === 0 && <p className="text-sm text-gray-400 italic">予定はありません</p>}
                  {fixedEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 group">
                      <div className="flex items-center gap-3">
                          <div className="bg-white px-2 py-1 rounded text-xs font-mono font-medium text-gray-600 border border-gray-200">
                          {event.startDate ? (event.endDate && event.endDate !== event.startDate ? `${event.startDate}〜${event.endDate} ` : `${event.startDate} `) : ''}{event.startTime} - {event.endTime}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{event.title}</span>
                      </div>
                      <button 
                        onClick={() => removeFixedEvent(event.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Tasks */}
            <div className="space-y-6">
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <List className="w-5 h-5 text-teal-500" />
                  <h2 className="text-lg font-semibold text-gray-800">2. やりたいタスク</h2>
                </div>

                <div className="space-y-4">
                   <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">タスク名</label>
                    <input 
                      type="text" 
                      placeholder="例: レポート作成、コードレビュー" 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">期限日時 (任意)</label>
                    <input
                      type="datetime-local"
                      value={newTaskDueDateTime}
                      onChange={(e) => setNewTaskDueDateTime(e.target.value)}
                      className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">所要時間 (分)</label>
                      <select 
                        value={newTaskDuration}
                        onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
                      >
                        <option value={15}>15分</option>
                        <option value={30}>30分</option>
                        <option value={45}>45分</option>
                        <option value={60}>60分</option>
                        <option value={90}>90分</option>
                        <option value={120}>120分</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">種別</label>
                      <select
                        value={newTaskKind}
                        onChange={(e) => setNewTaskKind(e.target.value as 'must' | 'want')}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
                      >
                        <option value="must">必須（やらねば）</option>
                        <option value="want">やりたいこと</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">楽しさ (1-5)</label>
                      <select 
                        value={newTaskFun}
                        onChange={(e) => setNewTaskFun(Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
                      >
                        <option value={5}>5 (とても楽しい)</option>
                        <option value={4}>4</option>
                        <option value={3}>3</option>
                        <option value={2}>2</option>
                        <option value={1}>1 (あまり楽しくない)</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={addTask}
                    className="w-full flex items-center justify-center gap-2 bg-teal-50 text-teal-600 hover:bg-teal-100 font-medium py-2 rounded-lg transition-colors border border-teal-100"
                  >
                    <Plus className="w-4 h-4" /> タスクを追加
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <input id="overnight" type="checkbox" checked={allowOvernight} onChange={(e)=>setAllowOvernight(e.target.checked)} className="w-4 h-4" />
                  <label htmlFor="overnight" className="text-sm text-gray-600">日をまたいでスケジュールを許可する</label>
                </div>

                {/* List of Tasks */}
                <div className="mt-6 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">タスクリスト</h3>
                  {tasks.length === 0 && <p className="text-sm text-gray-400 italic">タスクはありません</p>}
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 group">
                      <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${
                            task.kind === 'must' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-teal-50 text-teal-600 border-teal-100'
                          }`}>{task.kind === 'must' ? '必須' : `やりたい (${task.fun})`}</span>
                          <span className="text-sm font-medium text-gray-700">{task.title}</span>
                        </div>
                        <span className="text-xs text-gray-500 ml-4">{task.durationMinutes}分{task.dueDateTime ? ` ・ 締切: ${task.dueDateTime.replace('T',' ')}` : ''}</span>
                      </div>
                      <button 
                        onClick={() => removeTask(task.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Generate Button Area */}
              <div className="bg-indigo-50 rounded-xl p-6 text-center border border-indigo-100">
                <p className="text-indigo-800 text-sm mb-4">
                  予定とタスクの入力が完了したら、<br/>AIスケジュールを作成します。
                </p>
                <button 
                  onClick={handleGenerate}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
                >
                  <Brain className="w-5 h-5" />
                  スケジュールを計画する
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {/* Results View */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">今日のスケジュール</h2>
                  <p className="text-indigo-100 text-sm opacity-80">タスクの優先度と空き時間を考慮して最適化されました</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <Layout className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="p-6 bg-gray-50/50">
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[85px] top-4 bottom-4 w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {schedule.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <p>表示するスケジュールがありません。<br/>入力画面に戻って予定を追加してください。</p>
                      </div>
                    ) : (
                      (() => {
                        // Group schedule items by date (expecting timeRange starts with YYYY-MM-DD or fallback to weekStartDate)
                        const groups: Record<string, ScheduleItem[]> = {};
                        schedule.forEach(it => {
                          const firstToken = it.timeRange.split(' ')[0];
                          const isDate = /^\d{4}-\d{2}-\d{2}$/.test(firstToken);
                          const key = isDate ? firstToken : weekStartDate;
                          if (!groups[key]) groups[key] = [];
                          groups[key].push(it);
                        });
                        const keys = Object.keys(groups).sort();
                        return (
                          <div className="space-y-6">
                            {keys.map(dateKey => (
                              <div key={dateKey} className="bg-white p-4 rounded-lg border border-gray-100">
                                <div className="mb-3 flex items-center justify-between">
                                  <div>
                                    <h4 className="text-sm font-semibold">{dateKey}</h4>
                                    <p className="text-xs text-gray-400">{dateKey === weekStartDate ? '週開始日' : ''}</p>
                                  </div>
                                </div>
                                <div className="relative">
                                  <div className="absolute left-[85px] top-4 bottom-4 w-0.5 bg-gray-200"></div>
                                  <div className="space-y-4">
                                    {groups[dateKey].sort((a,b)=>{
                                      const aTime = a.timeRange.split(' ')[1] || a.timeRange.split(' ')[0];
                                      const bTime = b.timeRange.split(' ')[1] || b.timeRange.split(' ')[0];
                                      return aTime.localeCompare(bTime);
                                    }).map(item => (
                                      <div key={item.id} className="relative flex items-start group">
                                        <div className="w-[80px] pt-3 text-right pr-4 text-xs font-mono font-medium text-gray-500">
                                          {item.timeRange.split(' - ')[0]}
                                        </div>
                                        <div className={`absolute left-[85px] top-4 w-3 h-3 rounded-full border-2 transform -translate-x-1.5 z-10 ${
                                          item.type === 'fixed' ? 'bg-white border-gray-400' :
                                          item.type === 'break' ? 'bg-gray-200 border-gray-300' :
                                          'bg-indigo-600 border-indigo-600'
                                        }`}></div>
                                        <div className="flex-1 ml-4">
                                          <div className={`p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${
                                            item.type === 'fixed' 
                                              ? 'bg-gray-100 border-gray-200 text-gray-600' 
                                              : item.type === 'break'
                                              ? 'bg-amber-50 border-amber-100 border-dashed'
                                              : 'bg-white border-indigo-100'
                                          }`}>
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <h3 className={`font-bold ${
                                                  item.type === 'fixed' ? 'text-gray-600' : 
                                                  item.type === 'break' ? 'text-amber-700' : 'text-gray-800'
                                                }`}>{item.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <Clock className="w-3 h-3 text-gray-400" />
                                                  <span className="text-xs text-gray-500">{item.duration}分</span>
                                                  {item.fun !== undefined && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border bg-teal-50 text-teal-600 border-teal-100`}>
                                                      楽しさ: {item.fun}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                              {item.type === 'task' && <CheckCircle className="w-5 h-5 text-gray-200 hover:text-indigo-500 cursor-pointer" />}
                                              {item.type === 'break' && <Coffee className="w-5 h-5 text-amber-400" />}
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-gray-100/50 text-xs text-gray-400 flex items-center justify-end">
                                              {item.timeRange}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button 
                  onClick={() => setView('input')}
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
                >
                  条件を変更して再生成
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}