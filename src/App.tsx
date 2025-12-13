import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ScheduleProvider } from './context/ScheduleContext';
import InputPage from './pages/InputPage';
import PlanPage from './pages/PlanPage';
import './App.css';

function App() {
  return (
    <ScheduleProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<InputPage />} />
          <Route path="/plan" element={<PlanPage />} />
        </Routes>
      </div>
    </ScheduleProvider>
  );
}

export default App;