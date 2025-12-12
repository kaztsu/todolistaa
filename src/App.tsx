import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ⚠️ 重要: { } をつけてインポートする
import { AddTask } from "./components/AddTask";
import { TaskList } from "./components/TaskList";

import type { Task } from "./types";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  return (
    <BrowserRouter>
      <div className="App">
        <h1>ToDoアプリ</h1>

        <Routes>
          {/* 追加ページ (ルートパス) */}
          <Route
            path="/"
            element={<AddTask tasks={tasks} setTasks={setTasks} />}
          />

          {/* リストページ */}
          <Route
            path="/list"
            element={<TaskList tasks={tasks} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;