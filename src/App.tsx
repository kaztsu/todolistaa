import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, ArrowRight, CheckCircle, Brain, Coffee, Layout, List, Sparkles, ChevronLeft } from 'lucide-react';
import './App.css';

// ==========================================
// 1. 型定義
// ==========================================
interface FixedEvent {
  id: string;
  title: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
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
  date: string; // YYYY-MM-DD
  timeRange: string;
  title: string;
  type: 'fixed' | 'task' | 'break';
  duration: number;
  priority?: 'high' | 'medium' | 'low';
  startMinutes?: number; // 0:00 からの分
}

// ==========================================
// 2. 入力画面コンポーネント (InputPage)
// ==========================================
const InputPage: React.FC<{
  fixedEvents: FixedEvent[];
  tasks: Task[];
  onAddFixed: (event: Omit<FixedEvent, 'id' | 'type'>) => void;
  onRemoveFixed: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'type'>) => void;
  onRemoveTask: (id: string) => void;
  onGenerate: () => void;
}> = ({
  fixedEvents,
  tasks,
  onAddFixed,
  onRemoveFixed,
  onAddTask,
  onRemoveTask,
  onGenerate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [newEventDate, setNewEventDate] = useState(todayStr);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStart, setNewEventStart] = useState('');
  const [newEventEnd, setNewEventEnd] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState<number>(30);
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');

  const handleAddFixed = () => {
    if (!newEventTitle || !newEventDate || !newEventStart || !newEventEnd) return;
    onAddFixed({ title: newEventTitle, date: newEventDate, startTime: newEventStart, endTime: newEventEnd });
    setNewEventTitle('');
    setNewEventStart('');
    setNewEventEnd('');
  };

  const handleAddTask = () => {
    if (!newTaskTitle) return;
    onAddTask({ title: newTaskTitle, durationMinutes: newTaskDuration, priority: newTaskPriority });
    setNewTaskTitle('');
    setNewTaskDuration(30);
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* 左カラム: 固定予定 */}
        <section className="flex-1 w-full md:w-1/2 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/60 overflow-hidden h-full">
          <div className="p-6 border-b border-slate-100/50 flex items-center gap-3 bg-white/40">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Calendar className="w-5 h-5" /></div>
            <div><h2 className="text-lg font-bold text-slate-800">1. 決まっている予定</h2><p className="text-xs text-slate-400">日付を指定して登録</p></div>
          </div>
          
          <div className="p-5 bg-slate-50/50 border-b border-slate-100">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 space-y-3">
              <div><label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">日付</label><input type="date" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-sans" /></div>
              <div className="flex gap-2">
                <div className="w-1/2"><label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">開始</label><input type="time" value={newEventStart} onChange={(e) => setNewEventStart(e.target.value)} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-center" /></div>
                <div className="w-1/2"><label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">終了</label><input type="time" value={newEventEnd} onChange={(e) => setNewEventEnd(e.target.value)} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-center" /></div>
              </div>
              <div><label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">予定名</label><input type="text" placeholder="例: 会議" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddFixed()} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all" /></div>
              <button onClick={handleAddFixed} disabled={!newEventTitle || !newEventStart || !newEventEnd} className={`w-full py-2 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 font-bold text-sm ${(!newEventTitle || !newEventStart || !newEventEnd) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95 shadow-indigo-500/20'}`}><Plus className="w-4 h-4" /> 追加</button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[300px]">
              <tbody className="divide-y divide-slate-50 bg-white/50">
                {fixedEvents.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-xs text-slate-400">予定なし</td></tr>}
                {[...fixedEvents].sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600 whitespace-nowrap"><div className="text-[10px] text-slate-400">{event.date.slice(5).replace('-','/')}</div>{event.startTime}-{event.endTime}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700 break-words">{event.title}</td>
                    <td className="px-4 py-3 text-center"><button onClick={() => onRemoveFixed(event.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 右カラム: タスク */}
        <section className="flex-1 w-full md:w-1/2 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 border border-white/60 overflow-hidden h-full">
          <div className="p-6 border-b border-slate-100/50 flex items-center gap-3 bg-white/40">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><List className="w-5 h-5" /></div>
            <div><h2 className="text-lg font-bold text-slate-800">2. やりたいタスク</h2><p className="text-xs text-slate-400">1週間の中で自動配置</p></div>
          </div>

          <div className="p-5 bg-slate-50/50 border-b border-slate-100">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 space-y-3">
              <div><label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">タスク名</label><input type="text" placeholder="例: レポート作成" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 transition-all" /></div>
              <div className="flex gap-2">
                <div className="w-1/2"><label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">所要時間</label><select value={newTaskDuration} onChange={(e) => setNewTaskDuration(Number(e.target.value))} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer">{[15, 30, 45, 60, 90, 120, 180].map(m => <option key={m} value={m}>{m}分</option>)}</select></div>
                <div className="w-1/2"><label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">優先度</label><select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"><option value="high">高</option><option value="medium">中</option><option value="low">低</option></select></div>
              </div>
              <button onClick={handleAddTask} disabled={!newTaskTitle} className={`w-full py-2 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 font-bold text-sm ${!newTaskTitle ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 active:scale-95 shadow-purple-500/20'}`}><Plus className="w-4 h-4" /> 追加</button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[300px]">
              <tbody className="divide-y divide-slate-50 bg-white/50">
                {tasks.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-xs text-slate-400">タスクなし</td></tr>}
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{task.priority.toUpperCase()}</span></td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700 break-words">{task.title}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">{task.durationMinutes}分</td>
                    <td className="px-4 py-3 text-center"><button onClick={() => onRemoveTask(task.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-10 text-center pb-8 sticky bottom-0 z-20 pointer-events-none">
        <button onClick={onGenerate} className="pointer-events-auto w-full sm:w-auto px-12 py-4 group relative inline-flex items-center justify-center font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 overflow-hidden">
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
          <Sparkles className="w-5 h-5 mr-3 animate-pulse" />
          <span className="text-lg">週間スケジュールを作成</span>
          <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. 結果画面コンポーネント (PlanPage - Vertical Calendar)
// ==========================================
const PlanPage: React.FC<{
  schedule: ScheduleItem[];
  onBack: () => void;
}> = ({ schedule, onBack }) => {
  
  // 設定: カレンダーの開始時間と終了時間
  const START_HOUR = 8; // 8:00開始
  const END_HOUR = 20;  // 20:00終了
  const HOUR_HEIGHT = 60; // 1時間あたりの高さ(px)

  // 日付のリストを作成 (今日から7日間)
  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: ['日', '月', '火', '水', '木', '金', '土'][d.getDay()],
      dayNum: d.getDate()
    };
  });

  // 分数をピクセルに変換するヘルパー
  const getTopOffset = (minutes: number) => {
    return ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  };
  const getHeight = (duration: number) => {
    return (duration / 60) * HOUR_HEIGHT;
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-in slide-in-from-bottom-8 duration-700 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-200/50 border border-white/60 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white flex justify-between items-center shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Weekly Schedule</h2>
              <p className="text-indigo-100 text-xs opacity-90">AIが最適化した週間プラン</p>
            </div>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20"><Layout className="w-5 h-5 text-white" /></div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 overflow-auto relative custom-scrollbar bg-slate-50">
          <div className="min-w-[800px] relative pb-20">
            
            {/* Header Row (Dates) */}
            <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
              <div className="w-16 shrink-0 border-r border-slate-100 bg-slate-50"></div> {/* Time Col Placeholder */}
              {weekDates.map((d) => (
                <div key={d.dateStr} className={`flex-1 min-w-[100px] text-center py-3 border-r border-slate-100 ${d.dateStr === weekDates[0].dateStr ? 'bg-indigo-50/50' : ''}`}>
                  <div className="text-xs font-bold text-slate-400">{d.dayName}</div>
                  <div className={`text-lg font-bold ${d.dateStr === weekDates[0].dateStr ? 'text-indigo-600' : 'text-slate-700'}`}>{d.dayNum}</div>
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Time Column (Vertical Axis) */}
              <div className="w-16 shrink-0 bg-white border-r border-slate-200">
                {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map((hour) => (
                  <div key={hour} className="relative border-b border-slate-100 box-border text-right pr-2 pt-1" style={{ height: `${HOUR_HEIGHT}px` }}>
                    <span className="text-xs font-mono font-medium text-slate-400 -translate-y-1/2 block">{hour}:00</span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDates.map((d) => (
                <div key={d.dateStr} className="flex-1 min-w-[100px] border-r border-slate-100 relative bg-white/30">
                  {/* Grid Lines */}
                  {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
                    <div key={i} className="border-b border-slate-50" style={{ height: `${HOUR_HEIGHT}px` }}></div>
                  ))}

                  {/* Events */}
                  {schedule.filter(item => item.date === d.dateStr).map((item) => {
                    const top = getTopOffset(item.startMinutes || 0);
                    const height = getHeight(item.duration);
                    
                    // 範囲外のアイテムは表示しない
                    if ((item.startMinutes || 0) < START_HOUR * 60 || (item.startMinutes || 0) >= END_HOUR * 60) return null;

                    return (
                      <div
                        key={item.id}
                        className={`absolute inset-x-1 rounded-lg border p-1.5 shadow-sm overflow-hidden hover:z-10 hover:shadow-md transition-all group cursor-pointer flex flex-col ${
                          item.type === 'fixed' ? 'bg-slate-100 border-slate-200 text-slate-500' :
                          item.type === 'break' ? 'bg-amber-50 border-amber-100 border-dashed z-0' :
                          item.priority === 'high' ? 'bg-red-50 border-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                          'bg-blue-50 border-blue-100 text-blue-700'
                        }`}
                        style={{ top: `${top}px`, height: `${Math.max(height - 2, 24)}px` }}
                        title={`${item.timeRange} ${item.title}`}
                      >
                        <div className="flex items-center gap-1 text-[10px] font-mono opacity-70 leading-none mb-0.5">
                          {item.timeRange.split(' - ')[0]}
                        </div>
                        <div className="text-xs font-bold leading-tight truncate">
                          {item.title}
                        </div>
                        {height > 40 && item.type === 'task' && (
                           <div className="mt-auto pt-1 flex justify-end">
                             <CheckCircle className="w-3.5 h-3.5 opacity-30 hover:opacity-100 transition-opacity" />
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. メインアプリコンポーネント (App)
// ==========================================
type ViewMode = 'input' | 'schedule';

export default function App() {
  const [view, setView] = useState<ViewMode>('input');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([
    { id: '1', title: '定例会議', date: todayStr, startTime: '09:00', endTime: '10:00', type: 'fixed' },
    { id: '2', title: 'ランチ', date: todayStr, startTime: '12:00', endTime: '13:00', type: 'fixed' },
    { id: '3', title: '出張移動', date: tomorrowStr, startTime: '14:00', endTime: '16:00', type: 'fixed' },
  ]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'プレゼン資料', durationMinutes: 90, priority: 'high', type: 'task' },
    { id: '2', title: 'メール確認', durationMinutes: 30, priority: 'medium', type: 'task' },
    { id: '3', title: 'コードレビュー', durationMinutes: 45, priority: 'high', type: 'task' },
    { id: '4', title: '日報', durationMinutes: 15, priority: 'low', type: 'task' },
  ]);
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleItem[]>([]);

  const addFixedEvent = (eventData: Omit<FixedEvent, 'id' | 'type'>) => setFixedEvents([...fixedEvents, { ...eventData, id: Date.now().toString(), type: 'fixed' }]);
  const removeFixedEvent = (id: string) => setFixedEvents(fixedEvents.filter(e => e.id !== id));
  const addTask = (taskData: Omit<Task, 'id' | 'type'>) => setTasks([...tasks, { ...taskData, id: Date.now().toString(), type: 'task' }]);
  const removeTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleGenerate = () => {
    let finalItems: ScheduleItem[] = [];
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    let pendingTasks = [...tasks].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    const today = new Date();
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      if (pendingTasks.length === 0) break;
      const currentDateObj = new Date(today);
      currentDateObj.setDate(today.getDate() + dayOffset);
      const dateStr = currentDateObj.toISOString().split('T')[0];

      const todaysFixed = fixedEvents.filter(e => e.date === dateStr).map(e => ({ start: timeToMinutes(e.startTime), end: timeToMinutes(e.endTime), original: e })).sort((a, b) => a.start - b.start);
      todaysFixed.forEach(f => finalItems.push({ id: f.original.id, date: dateStr, timeRange: `${f.original.startTime} - ${f.original.endTime}`, title: f.original.title, type: 'fixed', duration: f.end - f.start, startMinutes: f.start }));

      let currentCursor = 9 * 60; 
      const dayEnd = 18 * 60;
      const nextDayTasks: Task[] = [];
      
      pendingTasks.forEach(task => {
        let isPlaced = false;
        while (currentCursor + task.durationMinutes <= dayEnd) {
          const candidateStart = currentCursor;
          const candidateEnd = currentCursor + task.durationMinutes;
          const conflict = todaysFixed.find(fixed => candidateStart < fixed.end && candidateEnd > fixed.start);
          if (conflict) {
            currentCursor = conflict.end;
          } else {
            finalItems.push({ id: `${task.id}-${dateStr}`, date: dateStr, timeRange: `${minutesToTime(candidateStart)} - ${minutesToTime(candidateEnd)}`, title: task.title, type: 'task', duration: task.durationMinutes, priority: task.priority, startMinutes: candidateStart });
            currentCursor = candidateEnd + 10;
            isPlaced = true;
            break;
          }
        }
        if (!isPlaced) nextDayTasks.push(task);
      });
      pendingTasks = nextDayTasks;
    }
    setGeneratedSchedule(finalItems);
    setView('schedule');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-600 font-sans pb-10 selection:bg-indigo-100 selection:text-indigo-700">
      <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30"><Brain className="w-5 h-5" /></div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">AI Scheduler</h1>
          </div>
          <nav className="flex bg-slate-100/50 p-1 rounded-xl backdrop-blur-sm border border-slate-200/50">
            <button onClick={() => setView('input')} className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${view === 'input' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>入力</button>
            <button onClick={() => { if (generatedSchedule.length === 0) handleGenerate(); setView('schedule'); }} className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${view === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>結果</button>
          </nav>
        </div>
      </header>
      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'input' ? <InputPage fixedEvents={fixedEvents} tasks={tasks} onAddFixed={addFixedEvent} onRemoveFixed={removeFixedEvent} onAddTask={addTask} onRemoveTask={removeTask} onGenerate={handleGenerate} /> : <PlanPage schedule={generatedSchedule} onBack={() => setView('input')} />}
      </main>
    </div>
  );
}