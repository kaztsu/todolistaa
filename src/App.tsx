import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, ArrowRight, CheckCircle, Brain, Coffee, Layout, List } from 'lucide-react';
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

  // Mock Generated Schedule (Logic would be replaced by your actual algorithm)
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
    // Here you would call your scheduling logic
    setView('schedule');
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
                          {event.startTime} - {event.endTime}
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
                      <label className="block text-xs font-medium text-gray-500 mb-1">優先度</label>
                      <select 
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
                      >
                        <option value="high">高 (High)</option>
                        <option value="medium">中 (Medium)</option>
                        <option value="low">低 (Low)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">期日</label>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={addTask}
                    className="w-full flex items-center justify-center gap-2 bg-teal-50 text-teal-600 hover:bg-teal-100 font-medium py-2 rounded-lg transition-colors border border-teal-100"
                  >
                    <Plus className="w-4 h-4" /> タスクを追加
                  </button>
                </div>

                {/* List of Tasks */}
                <div className="mt-6 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">タスクリスト</h3>
                  {tasks.length === 0 && <p className="text-sm text-gray-400 italic">タスクはありません</p>}
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 group">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            task.priority === 'high' ? 'bg-red-400' : 
                            task.priority === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                          }`} />
                          <span className="text-sm font-medium text-gray-700">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 ml-4">{task.durationMinutes}分</span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500">期日: {task.dueDate}</span>
                          )}
                        </div>
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
                    {mockSchedule.map((item, index) => (
                      <div key={item.id} className="relative flex items-start group">
                        {/* Time Column */}
                        <div className="w-[80px] pt-3 text-right pr-4 text-xs font-mono font-medium text-gray-500">
                          {item.timeRange.split(' - ')[0]}
                        </div>
                        
                        {/* Dot on Line */}
                        <div className={`absolute left-[85px] top-4 w-3 h-3 rounded-full border-2 transform -translate-x-1.5 z-10 ${
                          item.type === 'fixed' ? 'bg-white border-gray-400' :
                          item.type === 'break' ? 'bg-gray-200 border-gray-300' :
                          'bg-indigo-600 border-indigo-600'
                        }`}></div>

                        {/* Event Card */}
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
                                }`}>
                                  {item.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{item.duration}分</span>
                                  {item.priority && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                      item.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' :
                                      item.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                      'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                      {item.priority === 'high' ? '優先:高' : item.priority === 'medium' ? '優先:中' : '優先:低'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {item.type === 'task' && <CheckCircle className="w-5 h-5 text-gray-200 hover:text-indigo-500 cursor-pointer" />}
                              {item.type === 'break' && <Coffee className="w-5 h-5 text-amber-400" />}
                            </div>
                            
                            {/* Time Range Display inside card for mobile clarity */}
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