import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentTestPage from './pages/StudentTestPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
import AdminUploadPage from './pages/AdminUploadPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import StudentProgressPage from './pages/StudentProgressPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import DailyChallengePage from './pages/DailyChallengePage';
import { DarkModeProvider } from './contexts/DarkModeContext';

function StudentShell() {
  return (
    <ProtectedRoute roles={["student"]}>
      <DashboardLayout />
    </ProtectedRoute>
  );
}

function AdminShell() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <DashboardLayout />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/" element={<StudentShell />}> 
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="daily" element={<DailyChallengePage />} />
          <Route path="tests/:testId" element={<StudentTestPage />} />
          <Route path="progress" element={<StudentProgressPage />} />
        </Route>

        <Route path="/" element={<AdminShell />}> 
          <Route index element={<Navigate to="/questions" replace />} />
          <Route path="questions" element={<AdminQuestionsPage />} />
          <Route path="upload" element={<AdminUploadPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}
