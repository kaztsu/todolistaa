import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, ArrowRight, CheckCircle, Brain, Coffee, Layout, List, Sparkles } from 'lucide-react';
import './App.css';

// ==========================================
// 1. 型定義
// ==========================================
interface FixedEvent {
  id: string;
  title: string;
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
  timeRange: string;
  title: string;
  type: 'fixed' | 'task' | 'break';
  duration: number;
  priority?: 'high' | 'medium' | 'low';
  startMinutes?: number;
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
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStart, setNewEventStart] = useState('');
  const [newEventEnd, setNewEventEnd] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState<number>(30);
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');

  const handleAddFixed = () => {
    if (!newEventTitle || !newEventStart || !newEventEnd) return;
    onAddFixed({ title: newEventTitle, startTime: newEventStart, endTime: newEventEnd });
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
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* 左カラム: 固定予定 */}
        <section className="flex-1 w-full md:w-1/2 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/60 overflow-hidden h-full">
          <div className="p-6 border-b border-slate-100/50 flex items-center gap-3 bg-white/40">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">1. 決まっている予定</h2>
              <p className="text-xs text-slate-400">会議・移動・睡眠など</p>
            </div>
          </div>
          
          <div className="p-5 bg-slate-50/50 border-b border-slate-100">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 space-y-3">
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">開始</label>
                  <input type="time" value={newEventStart} onChange={(e) => setNewEventStart(e.target.value)} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-center" />
                </div>
                <div className="w-1/2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">終了</label>
                  <input type="time" value={newEventEnd} onChange={(e) => setNewEventEnd(e.target.value)} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-center" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">予定名</label>
                <input type="text" placeholder="例: ミーティング" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddFixed()} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <button onClick={handleAddFixed} disabled={!newEventTitle || !newEventStart || !newEventEnd} className={`w-full py-2 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 font-bold text-sm ${(!newEventTitle || !newEventStart || !newEventEnd) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95 shadow-indigo-500/20'}`}>
                <Plus className="w-4 h-4" /> 追加
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[300px]">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-4 py-3 whitespace-nowrap">時間</th>
                  <th className="px-4 py-3 w-full">予定名</th>
                  <th className="px-4 py-3 text-center">削除</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white/50">
                {fixedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600 whitespace-nowrap">{event.startTime} - {event.endTime}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700 break-words">{event.title}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => onRemoveFixed(event.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 右カラム: タスク */}
        <section className="flex-1 w-full md:w-1/2 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 border border-white/60 overflow-hidden h-full">
          <div className="p-6 border-b border-slate-100/50 flex items-center gap-3 bg-white/40">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <List className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">2. やりたいタスク</h2>
              <p className="text-xs text-slate-400">優先度の高い順に自動配置します</p>
            </div>
          </div>

          <div className="p-5 bg-slate-50/50 border-b border-slate-100">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">タスク名</label>
                <input type="text" placeholder="例: レポート作成" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">所要時間</label>
                  <select value={newTaskDuration} onChange={(e) => setNewTaskDuration(Number(e.target.value))} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer">
                    {[15, 30, 45, 60, 90, 120].map(m => <option key={m} value={m}>{m}分</option>)}
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">優先度</label>
                  <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)} className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer">
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
              </div>
              <button onClick={handleAddTask} disabled={!newTaskTitle} className={`w-full py-2 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 font-bold text-sm ${!newTaskTitle ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 active:scale-95 shadow-purple-500/20'}`}>
                <Plus className="w-4 h-4" /> 追加
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[300px]">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-4 py-3 whitespace-nowrap">優先度</th>
                  <th className="px-4 py-3 w-full">タスク名</th>
                  <th className="px-4 py-3 whitespace-nowrap">時間</th>
                  <th className="px-4 py-3 text-center">削除</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white/50">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700 break-words">{task.title}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">{task.durationMinutes}分</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => onRemoveTask(task.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-10 text-center pb-8">
        <button onClick={onGenerate} className="w-full sm:w-auto px-12 py-4 group relative inline-flex items-center justify-center font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 overflow-hidden">
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
          <Sparkles className="w-5 h-5 mr-3 animate-pulse" />
          <span className="text-lg">AIスケジュールを作成</span>
          <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. 結果画面コンポーネント (PlanPage)
// ==========================================
const PlanPage: React.FC<{
  schedule: ScheduleItem[];
  onBack: () => void;
}> = ({ schedule, onBack }) => {
  return (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-200/50 border border-white/60 overflow-hidden">
        
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Schedule Table</h2>
            <p className="text-indigo-100 mt-1 opacity-90 text-sm">あなたの入力と優先度に基づいて作成されました</p>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20">
            <Layout className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4 w-32">時間</th>
                <th className="px-6 py-4">内容</th>
                <th className="px-6 py-4 w-24">所要時間</th>
                <th className="px-6 py-4 w-32">タイプ/優先度</th>
                <th className="px-6 py-4 w-20 text-center">完了</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {schedule.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors group ${item.type === 'break' ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-600">
                      <Clock className="w-4 h-4 text-slate-300" />
                      {item.timeRange}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${item.type === 'fixed' ? 'text-slate-500' : item.type === 'break' ? 'text-amber-700' : 'text-slate-800'}`}>
                      {item.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {item.duration}分
                  </td>
                  <td className="px-6 py-4">
                    {item.type === 'fixed' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">固定予定</span>}
                    {item.type === 'break' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"><Coffee className="w-3 h-3 mr-1" /> 休憩</span>}
                    {item.type === 'task' && item.priority && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : item.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.type === 'task' ? (
                      <button className="text-slate-300 hover:text-indigo-600 transition-colors"><CheckCircle className="w-5 h-5 mx-auto" /></button>
                    ) : (
                      <span className="text-slate-200">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button onClick={onBack} className="px-6 py-2 text-sm text-slate-500 font-bold hover:text-indigo-600 flex items-center gap-2 transition-colors rounded-full hover:bg-white hover:shadow-sm">
            ← 入力画面に戻る
          </button>
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

  // データ管理
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([
    { id: '1', title: 'チーム朝会', startTime: '09:00', endTime: '09:30', type: 'fixed' },
    { id: '2', title: '昼休憩', startTime: '12:00', endTime: '13:00', type: 'fixed' },
  ]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Reactコンポーネント実装', durationMinutes: 60, priority: 'high', type: 'task' },
    { id: '2', title: 'メール返信', durationMinutes: 30, priority: 'medium', type: 'task' },
    { id: '3', title: '資料作成', durationMinutes: 45, priority: 'low', type: 'task' },
  ]);
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleItem[]>([]);

  // データ追加・削除
  const addFixedEvent = (eventData: Omit<FixedEvent, 'id' | 'type'>) => {
    const newEvent: FixedEvent = { ...eventData, id: Date.now().toString(), type: 'fixed' };
    setFixedEvents([...fixedEvents, newEvent]);
  };

  const removeFixedEvent = (id: string) => {
    setFixedEvents(fixedEvents.filter(e => e.id !== id));
  };

  const addTask = (taskData: Omit<Task, 'id' | 'type'>) => {
    const newTask: Task = { ...taskData, id: Date.now().toString(), type: 'task' };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // 時間計算ヘルパー
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // スケジュール生成アルゴリズム (衝突回避 + 優先度順)
  const handleGenerate = () => {
    let finalItems: ScheduleItem[] = [];

    // 1. 固定予定の配置
    const fixedIntervals = fixedEvents.map(e => ({
      id: e.id,
      start: timeToMinutes(e.startTime),
      end: timeToMinutes(e.endTime),
      title: e.title,
      type: 'fixed' as const,
      original: e
    })).sort((a, b) => a.start - b.start);

    fixedIntervals.forEach(f => {
      finalItems.push({
        id: f.id,
        timeRange: `${f.original.startTime} - ${f.original.endTime}`,
        title: f.title,
        type: 'fixed',
        duration: f.end - f.start,
        startMinutes: f.start
      });
    });

    // --- 追加: タスクを優先度順に並び替え ---
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const sortedTasks = [...tasks].sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      return weightB - weightA; // 降順 (3 -> 2 -> 1)
    });

    // 2. タスクの配置 (隙間を探す)
    let currentCursor = 9 * 60; 

    // sortedTasks を使うように変更
    sortedTasks.forEach((task) => {
      let isPlaced = false;
      let safetyCounter = 0;

      while (!isPlaced && safetyCounter < 100) {
        const candidateStart = currentCursor;
        const candidateEnd = currentCursor + task.durationMinutes;

        const conflict = fixedIntervals.find(fixed => {
          return candidateStart < fixed.end && candidateEnd > fixed.start;
        });

        if (conflict) {
          currentCursor = conflict.end;
        } else {
          finalItems.push({
            id: task.id,
            timeRange: `${minutesToTime(candidateStart)} - ${minutesToTime(candidateEnd)}`,
            title: task.title,
            type: 'task',
            duration: task.durationMinutes,
            priority: task.priority,
            startMinutes: candidateStart
          });
          currentCursor = candidateEnd + 10;
          isPlaced = true;
        }
        safetyCounter++;
      }
    });

    finalItems.sort((a, b) => (a.startMinutes || 0) - (b.startMinutes || 0));
    setGeneratedSchedule(finalItems);
    setView('schedule');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-600 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* 共通ヘッダー */}
      <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">
              AI Scheduler
            </h1>
          </div>
          
          <nav className="flex bg-slate-100/50 p-1 rounded-xl backdrop-blur-sm border border-slate-200/50">
            <button onClick={() => setView('input')} className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${view === 'input' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
              入力
            </button>
            <button onClick={() => { if (generatedSchedule.length === 0) handleGenerate(); setView('schedule'); }} className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${view === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
              結果
            </button>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'input' ? (
          <InputPage 
            fixedEvents={fixedEvents}
            tasks={tasks}
            onAddFixed={addFixedEvent}
            onRemoveFixed={removeFixedEvent}
            onAddTask={addTask}
            onRemoveTask={removeTask}
            onGenerate={handleGenerate}
          />
        ) : (
          <PlanPage 
            schedule={generatedSchedule}
            onBack={() => setView('input')}
          />
        )}
      </main>
      
      <div className="fixed bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50 shadow-[0_-4px_20px_rgba(99,102,241,0.4)]"></div>
    </div>
  );
}