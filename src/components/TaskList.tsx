import { Link } from "react-router-dom";
import type { Task } from "../types";

type TaskListProps = {
    tasks: Task[];
    // ▼ 追加: 関数を受け取るための型定義
    toggleTask: (id: number) => void;
};

// Propsに toggleTask を追加
export const TaskList = ({ tasks, toggleTask }: TaskListProps) => {
    return (
        <div>
            <h2>達成状況リスト</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {tasks.map((task) => (
                    <li key={task.id} style={{ marginBottom: "10px" }}>
                        <label style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                            {/* ▼ チェックボックスを追加 */}
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                            />

                            {/* ▼ 完了していたら横線を引くスタイル */}
                            <span style={{
                                textDecoration: task.completed ? "line-through" : "none",
                                color: task.completed ? "gray" : "black"
                            }}>
                                {task.text}
                            </span>
                        </label>
                    </li>
                ))}
            </ul>

            <div style={{ marginTop: "20px" }}>
                <Link to="/">← 追加ページに戻る</Link>
            </div>
        </div>
    );
};