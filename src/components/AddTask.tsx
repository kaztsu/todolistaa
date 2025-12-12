// src/components/AddTask.tsx (全体)
import { useState } from "react";
import { Link } from "react-router-dom";
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
      <h2>新しいタスクを追加</h2>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="例: 本を読む"
        className="input-field" /* ←追加 */
      />
      <button onClick={handleAdd} className="btn-primary"> /* ←追加 */
        追加する
      </button>
      
      <div>
        {/* style属性を削除し、classNameを追加 */}
        <Link to="/list" className="nav-link">
          リストを確認する →
        </Link>
      </div>
    </div>
  );
};