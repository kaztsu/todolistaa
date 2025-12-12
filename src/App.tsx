import { useState } from 'react'
import './App.css'

function App() {
  // 文字列（string）として管理する
  const [text, setText] = useState<string>("")

  // 「文字列の配列（string[]）」として管理する
  // ※ここが重要！ <string[]> を書かないとエラーになります
  const [todos, setTodos] = useState<string[]>([])

  const handleAdd = () => {
    if (text === "") return;
    setTodos([...todos, text]);
    setText("");
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

      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>
    </div>
  )
}

export default App