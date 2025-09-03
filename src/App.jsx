import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/common/Layout";
import TeacherLoginPage from "./pages/TeacherLoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import LifeRecordPage from "./pages/LifeRecord/LifeRecordPage"; // ✅ 추가
import SchedulePage from "./pages/SchedulePage"; // ✅ 추가

import ReportsPage from "./pages/Reportspage/ReportsPage";
import ReportsWeeklyPage from "./pages/Reportspage/ReportsWeeklyPage";
import ReportsMonthlyPage from "./pages/Reportspage/ReportsMonthlyPage";
import ReportsGradesPage from "./pages/Reportspage/ReportsGradesPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* 로그인은 레이아웃 없이 */}
        <Route path="/" element={<TeacherLoginPage />} />

        {/* 공통 레이아웃(사이드바+헤더) 적용되는 영역 */}
        <Route element={<Layout />}>
          {/* 대시보드 및 기존 섹션들 */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/attendance" element={<DashboardPage />} />
          <Route path="/grades" element={<DashboardPage />} />
          <Route path="/progress" element={<DashboardPage />} />
          <Route path="/notice" element={<DashboardPage />} />
          <Route path="/staffCollaboration" element={<DashboardPage />} />
          <Route path="/classSchedule" element={<DashboardPage />} />
          <Route path="/timetable" element={<DashboardPage />} />
          <Route path="/events" element={<DashboardPage />} />
          <Route path="/documents" element={<DashboardPage />} />
          <Route path="/facility" element={<DashboardPage />} />
          <Route path="/survey" element={<DashboardPage />} />

          {/* 생활기록부 (여러 경로 호환) */}
          <Route path="/life-record" element={<LifeRecordPage />} />
          <Route path="/LifeRecordPage" element={<LifeRecordPage />} />
          <Route path="/lifeRecord" element={<LifeRecordPage />} />

          {/* 일정 관리 */}
          <Route path="/schedule" element={<SchedulePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;