import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AddTask } from "./components/AddTask";
import { TaskList } from "./components/TaskList";
import type { Task } from "./types";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // ▼ 追加: 完了状態を切り替える関数
  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <h1>ToDoアプリ</h1>
        <Routes>
          <Route 
            path="/" 
            element={<AddTask tasks={tasks} setTasks={setTasks} />} 
          />
          <Route 
            path="/list" 
            // ▼ 変更: toggleTask関数を渡す
            element={<TaskList tasks={tasks} toggleTask={toggleTask} />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;