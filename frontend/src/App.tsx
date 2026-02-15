import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StudentLayout } from '@/components/StudentLayout';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Dashboard } from '@/pages/Dashboard';
import { AvailableCourses } from '@/pages/AvailableCourses';
import { MyPreferences } from '@/pages/MyPreferences';
import { AllotmentResult } from '@/pages/AllotmentResult';
import { Profile } from '@/pages/Profile';

function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#F5F7FB]">
      <p className="text-muted-foreground">Forgot password – Phase 2.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="courses" element={<AvailableCourses />} />
            <Route path="preferences" element={<MyPreferences />} />
            <Route path="result" element={<AllotmentResult />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
