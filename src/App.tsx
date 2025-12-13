import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Brain, List, ArrowRight } from 'lucide-react';

// --- Types ---
type ViewMode = 'input' | 'schedule';

interface FixedEvent {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  date?: string;     // YYYY-MM-DD (省略時は毎日)
  type: 'fixed';
}

interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  type: 'task';
}

interface ScheduleItem {
  id: string;
  timeRange: string; // "YYYY-MM-DD HH:mm - HH:mm"
  title: string;
  type: 'fixed' | 'task' | 'break';
  duration: number;
  priority?: 'high' | 'medium' | 'low';
}

// --- Constants ---
const DAY_START_HOUR = 8;  // 8:00開始
const DAY_END_HOUR = 20;   // 20:00終了
const HOUR_HEIGHT = 60;    // 1時間あたりの高さ(px)

// --- Helper Functions ---
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export default function App() {
  const [view, setView] = useState<ViewMode>('input');

  // --- State ---
  const [weekStartDate, setWeekStartDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  
  // 固定予定データ
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([
    { id: '1', title: 'チーム朝会', startTime: '09:00', endTime: '09:30', type: 'fixed' },
    { id: '2', title: '昼休憩', startTime: '12:00', endTime: '13:00', type: 'fixed' },
  ]);

  // タスクデータ
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'React実装', durationMinutes: 60, priority: 'high', type: 'task' },
    { id: '2', title: 'メール返信', durationMinutes: 30, priority: 'medium', type: 'task' },
    { id: '3', title: '資料作成', durationMinutes: 90, priority: 'medium', type: 'task' },
  ]);

  // 入力フォーム用State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStart, setNewEventStart] = useState('');
  const [newEventEnd, setNewEventEnd] = useState('');
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState<number>(30);
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');

  // 生成結果
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  // --- Handlers ---
  const addFixedEvent = () => {
    if (!newEventTitle || !newEventStart || !newEventEnd) return;
    const newEvent: FixedEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      startTime: newEventStart,
      endTime: newEventEnd,
      type: 'fixed',
    };
    setFixedEvents([...fixedEvents, newEvent]);
    setNewEventTitle('');
    setNewEventStart('');
    setNewEventEnd('');
  };

  const addTask = () => {
    if (!newTaskTitle) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      durationMinutes: newTaskDuration,
      priority: newTaskPriority,
      type: 'task',
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDuration(30);
  };

  const removeFixedEvent = (id: string) => {
    setFixedEvents(fixedEvents.filter(e => e.id !== id));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // --- Logic: Schedule Generation ---
  const handleGenerate = () => {
    const result = generateSchedule(fixedEvents, tasks, weekStartDate);
    setSchedule(result);
    setView('schedule');
  };

  const generateSchedule = (fixedEv: FixedEvent[], taskList: Task[], startDateStr: string): ScheduleItem[] => {
    const result: ScheduleItem[] = [];
    const daysToPlan = 7;
    const dayStartM = DAY_START_HOUR * 60;
    const dayEndM = DAY_END_HOUR * 60;

    // 1. 各日の「埋まっている時間帯」を管理するマップを作成
    // key: "YYYY-MM-DD", value: Array of {start, end} (minutes)
    const busySlots: Record<string, {start: number, end: number}[]> = {};

    // 日付ごとの初期化と固定予定の配置
    for (let i = 0; i < daysToPlan; i++) {
      const d = new Date(startDateStr);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      busySlots[dateKey] = [];

      // 固定予定を追加
      fixedEv.forEach(ev => {
        // 日付指定がない(毎日) または 日付が一致する場合
        if (!ev.date || ev.date === dateKey) {
          const s = timeToMinutes(ev.startTime);
          const e = timeToMinutes(ev.endTime);
          
          // 結果に追加
          result.push({
            id: `${dateKey}-${ev.id}`,
            timeRange: `${dateKey} ${ev.startTime} - ${ev.endTime}`,
            title: ev.title,
            type: 'fixed',
            duration: e - s
          });
          
          // 埋まり時間として記録
          busySlots[dateKey].push({ start: s, end: e });
        }
      });

      // 時間順にソート
      busySlots[dateKey].sort((a, b) => a.start - b.start);
    }

    // 2. タスクを空き時間に割り当て (単純なアルゴリズム: 優先度順に前から詰める)
    // 優先度順にソート (high > medium > low)
    const priorityScore = { high: 3, medium: 2, low: 1 };
    const sortedTasks = [...taskList].sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

    sortedTasks.forEach(task => {
      let allocated = false;

      // 日付順に空きを探す
      for (let i = 0; i < daysToPlan; i++) {
        if (allocated) break;
        
        const d = new Date(startDateStr);
        d.setDate(d.getDate() + i);
        const dateKey = d.toISOString().slice(0, 10);
        const dayBusy = busySlots[dateKey];

        // その日の探索開始時間
        let currentTime = dayStartM;

        // 既存の予定の隙間をチェック
        for (const slot of dayBusy) {
          // 現在時刻から次の予定開始までの隙間があるか
          if (slot.start - currentTime >= task.durationMinutes) {
            // 割り当て可能
            const startStr = minutesToTime(currentTime);
            const endM = currentTime + task.durationMinutes;
            const endStr = minutesToTime(endM);

            result.push({
              id: `${dateKey}-${task.id}`,
              timeRange: `${dateKey} ${startStr} - ${endStr}`,
              title: task.title,
              type: 'task',
              duration: task.durationMinutes,
              priority: task.priority
            });

            // Busyスロットを更新 (簡易的に挿入して再ソート)
            dayBusy.push({ start: currentTime, end: endM });
            dayBusy.sort((a, b) => a.start - b.start);
            
            allocated = true;
            break;
          }
          // 次の探索開始時間は、今の予定の終了時間
          currentTime = Math.max(currentTime, slot.end);
        }

        // 全ての予定の後ろ（夕方以降）をチェック
        if (!allocated && (dayEndM - currentTime >= task.durationMinutes)) {
            const startStr = minutesToTime(currentTime);
            const endM = currentTime + task.durationMinutes;
            const endStr = minutesToTime(endM);

            result.push({
              id: `${dateKey}-${task.id}`,
              timeRange: `${dateKey} ${startStr} - ${endStr}`,
              title: task.title,
              type: 'task',
              duration: task.durationMinutes,
              priority: task.priority
            });

            dayBusy.push({ start: currentTime, end: endM });
            allocated = true;
        }
      }
    });

    return result;
  };

  // --- Display Helpers ---
  const getWeekDates = () => {
    const dates = [];
    const base = new Date(weekStartDate);
    for(let i=0; i<7; i++){
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const getEventStyle = (item: ScheduleItem) => {
    // "YYYY-MM-DD HH:mm - HH:mm"
    const [, timePart] = item.timeRange.split(' '); // "HH:mm"
    const [startStr] = timePart.split(' - ');
    
    const startMinutes = timeToMinutes(startStr);
    const dayStartMinutes = DAY_START_HOUR * 60;
    
    const top = ((startMinutes - dayStartMinutes) / 60) * HOUR_HEIGHT;
    const height = (item.duration / 60) * HOUR_HEIGHT;
    
    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">AI Scheduler</h1>
          </div>
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView('input')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                view === 'input' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              入力・設定
            </button>
            <button
              onClick={() => setView('schedule')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                view === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              週間カレンダー
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {view === 'input' ? (
          // --- 入力画面 ---
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {/* 左側: 固定の予定 */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-bold text-gray-800">1. 決まっている予定</h2>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">週の開始日</label>
                    <input 
                      type="date" 
                      value={weekStartDate} 
                      onChange={e => setWeekStartDate(e.target.value)} 
                      className="border border-gray-300 rounded-lg p-2 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">予定を追加</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        placeholder="例: 会議、ランチ" 
                        value={newEventTitle} 
                        onChange={e => setNewEventTitle(e.target.value)} 
                        className="border border-gray-300 rounded-lg p-2 text-sm flex-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <input 
                          type="time" 
                          value={newEventStart} 
                          onChange={e => setNewEventStart(e.target.value)} 
                          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <span className="self-center text-gray-400">-</span>
                        <input 
                          type="time" 
                          value={newEventEnd} 
                          onChange={e => setNewEventEnd(e.target.value)} 
                          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button 
                          onClick={addFixedEvent} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Plus className="w-5 h-5"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">登録済みリスト</h3>
                  {fixedEvents.length === 0 && <p className="text-sm text-gray-400 italic">予定はありません</p>}
                  {fixedEvents.map(e => (
                    <div key={e.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 group">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700 block">{e.title}</span>
                        <span className="text-xs text-gray-500 font-mono">{e.startTime} - {e.endTime}</span>
                      </div>
                      <button 
                        onClick={() => removeFixedEvent(e.id)} 
                        className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 右側: タスク */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <List className="w-5 h-5 text-teal-500" />
                  <h2 className="font-bold text-gray-800">2. やりたいタスク</h2>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">タスク名・所要時間</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="例: 資料作成" 
                        value={newTaskTitle} 
                        onChange={e => setNewTaskTitle(e.target.value)} 
                        className="border border-gray-300 rounded-lg p-2 text-sm flex-1 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <input 
                        type="number" 
                        value={newTaskDuration} 
                        onChange={e => setNewTaskDuration(Number(e.target.value))} 
                        className="border border-gray-300 rounded-lg p-2 text-sm w-20 text-center focus:ring-2 focus:ring-teal-500 outline-none"
                        min={1}
                      />
                      <span className="self-center text-sm text-gray-500">分</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">優先度</label>
                     <div className="flex gap-2">
                        <select 
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                          className="border border-gray-300 rounded-lg p-2 text-sm flex-1 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                        >
                          <option value="high">高 (High)</option>
                          <option value="medium">中 (Medium)</option>
                          <option value="low">低 (Low)</option>
                        </select>
                        <button 
                          onClick={addTask} 
                          className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Plus className="w-5 h-5"/> 追加
                        </button>
                     </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">タスクリスト</h3>
                  {tasks.length === 0 && <p className="text-sm text-gray-400 italic">タスクはありません</p>}
                  {tasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 group">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700 block">{t.title}</span>
                        <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="bg-white px-1.5 rounded border border-gray-200">{t.durationMinutes}分</span>
                          {t.priority === 'high' && <span className="text-red-500 font-medium">優先:高</span>}
                          {t.priority === 'medium' && <span className="text-yellow-600">優先:中</span>}
                          {t.priority === 'low' && <span className="text-blue-500">優先:低</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeTask(t.id)} 
                        className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100">
                  <button 
                    onClick={handleGenerate} 
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Brain className="w-5 h-5" />
                    スケジュールを生成する
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // --- 結果画面 (週間カレンダー) ---
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4">
            
            {/* Calendar Header (Dates) */}
            <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
              <div className="p-4 border-r border-gray-200 text-center text-xs font-semibold text-gray-400 bg-gray-50">
                TIME
              </div>
              {getWeekDates().map((date, index) => {
                 const isToday = new Date().toDateString() === date.toDateString();
                 return (
                  <div key={index} className={`p-3 text-center border-r border-gray-100 ${index === 6 ? 'border-r-0' : ''} ${isToday ? 'bg-indigo-50/50' : 'bg-gray-50'}`}>
                    <div className="text-xs font-medium text-gray-500 uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className={`text-sm font-bold mt-1 ${isToday ? 'text-indigo-600' : 'text-gray-800'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calendar Body (Scrollable) */}
            <div className="overflow-y-auto h-[600px] relative bg-white">
              <div className="grid grid-cols-8 relative" style={{ height: `${(DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT}px` }}>
                
                {/* Time Axis (Left) */}
                <div className="border-r border-gray-200 bg-white z-10 sticky left-0">
                  {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }).map((_, i) => (
                    <div key={i} className="text-right pr-3 text-xs text-gray-400 relative border-b border-gray-50 box-border" style={{ height: `${HOUR_HEIGHT}px` }}>
                      <span className="relative -top-2 bg-white pl-1">{String(DAY_START_HOUR + i).padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {getWeekDates().map((date, colIndex) => {
                  const dateStr = date.toISOString().slice(0, 10);
                  const dayEvents = schedule.filter(s => s.timeRange.startsWith(dateStr));

                  return (
                    <div key={colIndex} className="relative border-r border-gray-100 last:border-r-0 hover:bg-gray-50/30 transition-colors">
                       {/* Grid Lines */}
                       {Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }).map((_, i) => (
                          <div key={i} className="border-b border-gray-100 w-full absolute" style={{ top: `${i * HOUR_HEIGHT}px` }}></div>
                       ))}

                       {/* Event Cards */}
                       {dayEvents.map((item) => {
                         const style = getEventStyle(item);
                         return (
                           <div
                             key={item.id}
                             className={`absolute w-[95%] left-[2.5%] rounded px-2 py-1 text-xs border overflow-hidden shadow-sm hover:z-10 hover:shadow-md transition-all cursor-pointer group ${
                               item.type === 'fixed' ? 'bg-gray-100 border-gray-300 text-gray-700' :
                               item.priority === 'high' ? 'bg-red-50 border-red-200 text-red-700' :
                               item.priority === 'medium' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                               'bg-blue-50 border-blue-200 text-blue-700'
                             }`}
                             style={style}
                             title={`${item.title} (${item.timeRange})`}
                           >
                             <div className="font-bold truncate">{item.title}</div>
                             <div className="opacity-80 truncate text-[10px] flex items-center gap-1">
                               <Clock className="w-3 h-3"/>
                               {item.timeRange.split(' ')[1].replace(' - ', '-')}
                             </div>
                           </div>
                         );
                       })}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
               <span>表示範囲: {DAY_START_HOUR}:00 - {DAY_END_HOUR}:00</span>
               <button onClick={() => setView('input')} className="text-indigo-600 hover:underline flex items-center gap-1">
                 <ArrowRight className="w-3 h-3 transform rotate-180"/>
                 条件を変更して再生成
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}