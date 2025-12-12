import { useState } from 'react'
import './App.css'

// 1. タスクの「型（設計図）」を定義します
type Todo = {
  id: number;
  text: string;
  isDone: boolean; // 完了しているかどうか
};

function App() {
  const [text, setText] = useState<string>("");

  // 2. stateの型を「Todoの配列」に変更します
  const [todos, setTodos] = useState<Todo[]>([]);

  const handleAdd = () => {
    if (text === "") return;

    // 新しいタスクをオブジェクトとして作成
    const newTodo: Todo = {
      id: Date.now(), // 現在時刻をIDにする（被らない番号を作るため）
      text: text,
      isDone: false, //最初は未完了
    };

    setTodos([...todos, newTodo]);
    setText("");
  };

  // 3. チェックボックスを押したときの処理
  const handleToggle = (id: number) => {
    const newTodos = todos.map((todo) => {
      // 指定されたIDのタスクなら、isDoneを反転させる
      if (todo.id === id) {
        return { ...todo, isDone: !todo.isDone };
      }
      return todo;
    });
    setTodos(newTodos);
  };

  // 削除機能（IDを使って消すように修正）
  const handleDelete = (id: number) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>マイ ToDo リスト (TS版)</h1>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="タスクを入力..."
        style={{ padding: "8px", fontSize: "16px" }}
      />
      <button onClick={handleAdd} style={{ padding: "8px 16px", marginLeft: "8px" }}>追加</button>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              marginBottom: "10px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* チェックボックス */}
              <input
                type="checkbox"
                checked={todo.isDone}
                onChange={() => handleToggle(todo.id)}
                style={{ marginRight: "10px" }}
              />

              {/* タスクの文字（完了なら取り消し線をつける） */}
              <span style={{
                textDecoration: todo.isDone ? "line-through" : "none",
                color: todo.isDone ? "gray" : "black"
              }}>
                {todo.text}
              </span>
            </div>

            <button
              onClick={() => handleDelete(todo.id)}
              style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App