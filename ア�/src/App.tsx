// src/App.tsx
import { useEffect, useState } from 'react';
import './App.css'

function App() {
  const [todos, setTodos] = useState(() => {
    // ページが初めて読み込まれたときに localStorage からデータを取得
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : []; // 取得したデータを配列に変換
  });
  const [newTodo, setNewTodo] = useState(''); // 新しいタスクの入力値

  // todosが変更されるたびにlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos)); // todosを文字列に変換して保存
  }, [todos]);

  const addTodo = () => {
    if (newTodo) {
      setTodos([...todos, newTodo]); // 新しいタスクを追加
      setNewTodo(''); // 入力フィールドを空に戻す
    }
  }

  const deleteTodo = (index: number) => {
    const updatedTodos = todos.filter((_: string, i: number) => i !== index); // 指定したタスクを削除
    setTodos(updatedTodos);
  }

  return (
    <div>
      <h1>Todoアプリ</h1>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="あたらしいタスク"
      />
      <button onClick={addTodo}>追加</button> {/* ボタンをクリックしてタスクを追加 */}

      <ul>
        {todos.map((todo: string, index: number) => (
          <li key={index}>
            {todo}
            <button onClick={() => deleteTodo(index)}>削除</button> {/* 削除ボタン */}
          </li> // タスクをリストで表示
        ))}
      </ul>

    </div>
  );
}

export default App