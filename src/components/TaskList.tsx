import { Link } from "react-router-dom";
// ⚠️ 重要: ここも 'type' をつける
import type { Task } from "../types";

type TaskListProps = {
  tasks: Task[];
};

export const TaskList = ({ tasks }: TaskListProps) => {
  return (
    <div>
      <h2>達成状況リスト</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span>{task.text}</span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "20px" }}>
        <Link to="/">← 追加ページに戻る</Link>
      </div>
    </div>
  );
};