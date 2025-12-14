// src/components/TaskList.tsx (全体)
import { Link } from "react-router-dom";
import type { Task } from "../types";

type TaskListProps = {
    tasks: Task[];
    toggleTask: (id: number) => void;
};

export const TaskList = ({ tasks, toggleTask }: TaskListProps) => {
    return (
        <div>
            <h2>達成状況リスト</h2>
            {/* classNameを追加 */}
            <ul className="task-list">
                {tasks.map((task) => (
                    <li
                        key={task.id}
                        // 完了状態によってクラス名を切り替える重要な部分！
                        className={`task-item ${task.completed ? "completed" : ""}`}
                    >
                        <label style={{ display: "flex", alignItems: "center", width: "100%", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                                className="checkbox-input" /* ←追加 */
                            />

                            {/* インラインスタイルを削除し、クラスを適用 */}
                            <span className="task-text">
                                {task.text}
                            </span>
                        </label>
                    </li>
                ))}
            </ul>

            <div>
                {/* style属性を削除し、classNameを追加 */}
                <Link to="/" className="nav-link">
                    ← 追加ページに戻る
                </Link>
            </div>
        </div>
    );
};