import { useState } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState<string>("")
  const [todos, setTodos] = useState<string[]>([])

  // 追加機能
  const handleAdd = () => {
    if (text === "") return;
    setTodos([...todos, text]);
    setText("");
  };

  // ★ 削除機能（新しく追加）
  const handleDelete = (index: number) => {
    // フィルタリングを使って、「押された番号(index)以外のもの」だけの新しいリストを作る
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>マイ ToDo リスト (TS版)</h1>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="タスクを入力..."
      />
      <button onClick={handleAdd}>追加</button>

      <ul style={{ marginTop: "20px" }}>
        {todos.map((todo, index) => (
          <li key={index} style={{ marginBottom: "10px" }}>
            {todo}
            {/* ★ 削除ボタン（新しく追加） */}
            <button
              onClick={() => handleDelete(index)}
              style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}
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