import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, ArrowRight, CheckCircle, Brain, Coffee, Layout, List, Sparkles } from 'lucide-react';
import './App.css';

// --- Types ---
type ViewMode = 'input' | 'schedule';

interface FixedEvent {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  type: 'fixed';
}

interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string; // YYYY-MM-DD
  type: 'task';
}

interface ScheduleItem {
  id: string;
  timeRange: string;
  title: string;
  type: 'fixed' | 'task' | 'break';
  duration: number;
  priority?: 'high' | 'medium' | 'low';
}

export default function App() {
  const [view, setView] = useState<ViewMode>('input');

  // State for Inputs
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([
    { id: '1', title: 'チーム朝会', startTime: '09:00', endTime: '09:30', type: 'fixed' },
    { id: '2', title: '昼休憩', startTime: '12:00', endTime: '13:00', type: 'fixed' },
  ]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Reactコンポーネント実装', durationMinutes: 60, priority: 'high', type: 'task' },
    { id: '2', title: 'メール返信', durationMinutes: 30, priority: 'medium', type: 'task' },
  ]);

  // Temporary Inputs
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStart, setNewEventStart] = useState('');
  const [newEventEnd, setNewEventEnd] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState<number>(30);
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');

  // Mock Generated Schedule
  const mockSchedule: ScheduleItem[] = [
    { id: 's1', timeRange: '09:00 - 09:30', title: 'チーム朝会', type: 'fixed', duration: 30 },
    { id: 's2', timeRange: '09:30 - 10:30', title: 'Reactコンポーネント実装', type: 'task', duration: 60, priority: 'high' },
    { id: 's3', timeRange: '10:30 - 10:45', title: '休憩 / バッファ', type: 'break', duration: 15 },
    { id: 's4', timeRange: '10:45 - 11:15', title: 'メール返信', type: 'task', duration: 30, priority: 'medium' },
    { id: 's5', timeRange: '12:00 - 13:00', title: '昼休憩', type: 'fixed', duration: 60 },
  ];

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
      dueDate: newTaskDueDate || undefined,
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

  const handleGenerate = () => {
    setView('schedule');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-600 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">
              AI Scheduler
            </h1>
          </div>
          
          <nav className="flex bg-slate-100/50 p-1 rounded-xl backdrop-blur-sm border border-slate-200/50">
            <button
              onClick={() => setView('input')}
              className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                view === 'input' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              入力
            </button>
            <button
              onClick={() => setView('schedule')}
              className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                view === 'schedule' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              結果
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {view === 'input' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
            {/* Left Column: Fixed Events */}
            <div className="space-y-6">
              <section className="h-full bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/60 p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">1. 決まっている予定</h2>
                    <p className="text-xs text-slate-400">会議・移動・睡眠など</p>
                  </div>
                </div>
                
                <div className="space-y-5 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">開始</label>
                      <input 
                        type="time" 
                        value={newEventStart}
                        onChange={(e) => setNewEventStart(e.target.value)}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-xl border-0 ring-1 ring-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">終了</label>
                      <input 
                        type="time" 
                        value={newEventEnd}
                        onChange={(e) => setNewEventEnd(e.target.value)}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-xl border-0 ring-1 ring-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm font-mono text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">予定名</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="例: ミーティング" 
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="flex-1 bg-white/50 backdrop-blur-sm rounded-xl border-0 ring-1 ring-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                      />
                      <button 
                        onClick={addFixedEvent}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">登録済みリスト</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {fixedEvents.length === 0 && <p className="text-sm text-slate-400 italic text-center py-8 bg-slate-50/50 rounded-xl">予定はありません</p>}
                    {fixedEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-500 border border-slate-200">
                            {event.startTime} - {event.endTime}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{event.title}</span>
                        </div>
                        <button onClick={() => removeFixedEvent(event.id)} className="text-slate-300 hover:text-red-500 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Tasks */}
            <div className="space-y-6">
              <section className="h-full bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 border border-white/60 p-6 relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                    <List className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">2. やりたいタスク</h2>
                    <p className="text-xs text-slate-400">隙間時間に自動配置します</p>
                  </div>
                </div>

                <div className="space-y-5 relative z-10">
                   <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">タスク名</label>
                    <input 
                      type="text" 
                      placeholder="例: レポート作成" 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-white/50 backdrop-blur-sm rounded-xl border-0 ring-1 ring-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">所要時間</label>
                      <select 
                        value={newTaskDuration}
                        onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                        className="w-full bg-white/50 backdrop-blur-sm rounded-xl border-0 ring-1 ring-slate-200 px-3 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value={15}>15分</option>
                        <option value={30}>30分</option>
                        <option value={60}>60分</option>
                        <option value={90}>90分</option>
                        <option value={120}>120分</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">優先度</label>
                      <div className="flex bg-white/50 rounded-xl p-1 ring-1 ring-slate-200">
                        {['high', 'medium', 'low'].map((p) => (
                          <button
                            key={p}
                            onClick={() => setNewTaskPriority(p as any)}
                            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                              newTaskPriority === p 
                                ? p === 'high' ? 'bg-red-100 text-red-600 shadow-sm' 
                                : p === 'medium' ? 'bg-amber-100 text-amber-600 shadow-sm'
                                : 'bg-blue-100 text-blue-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={addTask}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-purple-50 text-purple-600 font-bold py-3 rounded-xl transition-all border border-purple-100 hover:border-purple-200 hover:shadow-md"
                  >
                    <Plus className="w-4 h-4" /> タスクを追加
                  </button>
                </div>

                <div className="mt-8 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">タスクリスト</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {tasks.length === 0 && <p className="text-sm text-slate-400 italic text-center py-8 bg-slate-50/50 rounded-xl">タスクはありません</p>}
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shadow-sm ${
                              task.priority === 'high' ? 'bg-red-500 shadow-red-200' : 
                              task.priority === 'medium' ? 'bg-amber-400 shadow-amber-200' : 'bg-blue-400 shadow-blue-200'
                            }`} />
                            <span className="text-sm font-bold text-slate-700">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-3 pl-4">
                            <span className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{task.durationMinutes}分</span>
                          </div>
                        </div>
                        <button onClick={() => removeTask(task.id)} className="text-slate-300 hover:text-red-500 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Generate Button */}
              <div className="pt-4 text-center">
                <button 
                  onClick={handleGenerate}
                  className="w-full group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  <span className="text-lg">AIスケジュールを作成</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
            {/* Results View: Table Format */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-200/50 border border-white/60 overflow-hidden">
              
              {/* Header Area */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Schedule Table</h2>
                  <p className="text-indigo-100 mt-1 opacity-90 text-sm">タスクと予定の一覧表示</p>
                </div>
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20">
                  <Layout className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Table Area */}
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
                    {mockSchedule.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50/80 transition-colors group ${
                          item.type === 'break' ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Time Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-600">
                            <Clock className="w-4 h-4 text-slate-300" />
                            {item.timeRange}
                          </div>
                        </td>

                        {/* Title Column */}
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${
                            item.type === 'fixed' ? 'text-slate-500' : 
                            item.type === 'break' ? 'text-amber-700' : 'text-slate-800'
                          }`}>
                            {item.title}
                          </span>
                        </td>

                        {/* Duration Column */}
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                          {item.duration}分
                        </td>

                        {/* Priority/Type Column */}
                        <td className="px-6 py-4">
                          {item.type === 'fixed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              固定予定
                            </span>
                          )}
                          {item.type === 'break' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                              <Coffee className="w-3 h-3 mr-1" /> 休憩
                            </span>
                          )}
                          {item.type === 'task' && item.priority && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              item.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' :
                              item.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                            </span>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="px-6 py-4 text-center">
                          {item.type === 'task' ? (
                            <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                              <CheckCircle className="w-5 h-5 mx-auto" />
                            </button>
                          ) : (
                            <span className="text-slate-200">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Back Button */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                <button 
                  onClick={() => setView('input')}
                  className="px-6 py-2 text-sm text-slate-500 font-bold hover:text-indigo-600 flex items-center gap-2 transition-colors rounded-full hover:bg-white hover:shadow-sm"
                >
                   ← 入力画面に戻る
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50 shadow-[0_-4px_20px_rgba(99,102,241,0.4)]"></div>
    </div>
  );
}