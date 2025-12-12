import { useState } from "react";
import { Link } from "react-router-dom";
// ⚠️ 重要: 型としてインポートするために 'type' をつける
import type { Task } from "../types";

type AddTaskProps = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

export const AddTask = ({ tasks, setTasks }: AddTaskProps) => {
  const [text, setText] = useState<string>("");

  const handleAdd = () => {
    if (!text) return;
    const newTask: Task = {
      id: Date.now(),
      text: text,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setText("");
  };

  return (
    <div>
      <h2>タスク追加ページ</h2>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="タスクを入力"
      />
      <button onClick={handleAdd}>追加</button>
      
      <div style={{ marginTop: "20px" }}>
        <Link to="/list">リストを見る→</Link>
      </div>
    </div>
  );
};