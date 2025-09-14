import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentTestPage from './pages/StudentTestPage';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
import AdminUploadPage from './pages/AdminUploadPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import StudentProgressPage from './pages/StudentProgressPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminUsersPage from './pages/AdminUsersPage';
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

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}

export default function App() {
  try {
    return (
      <ErrorBoundary>
        <DarkModeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route path="/student" element={<StudentShell />}> 
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="daily" element={<DailyChallengePage />} />
                <Route path="tests/:testId" element={<StudentTestPage />} />
                <Route path="progress" element={<StudentProgressPage />} />
              </Route>

              <Route path="/admin" element={<AdminShell />}> 
                <Route index element={<Navigate to="/admin/questions" replace />} />
                <Route path="questions" element={<AdminQuestionsPage />} />
                <Route path="upload" element={<AdminUploadPage />} />
                <Route path="students" element={<AdminStudentsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DarkModeProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App error:', error);
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>App Error</h1>
        <p>Something went wrong. Check the console for details.</p>
        <p>Error: {String(error)}</p>
      </div>
    );
  }
}
