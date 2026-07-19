import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PODashboard from './pages/PODashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from 'react-hot-toast';

// Student Pages
import StudentProfile from './pages/StudentProfile';
import StudentJobs from './pages/StudentJobs';
import StudentApplications from './pages/StudentApplications';
import StudentDrives from './pages/StudentDrives';
import StudentInterviews from './pages/StudentInterviews';
import StudentOffers from './pages/StudentOffers';
import ResumeBuilder from './pages/ResumeBuilder';
import Settings from './pages/Settings';

// Recruiter Pages
import RecruiterJobs from './pages/RecruiterJobs';
import RecruiterApplications from './pages/RecruiterApplications';
import CandidateSearch from './pages/CandidateSearch';
import CompanyProfile from './pages/CompanyProfile';

// Route Dispatchers based on role
const JobsDispatcher: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return user?.role === 'recruiter' ? <RecruiterJobs /> : <StudentJobs />;
};

const ApplicationsDispatcher: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return user?.role === 'recruiter' ? <RecruiterApplications /> : <StudentApplications />;
};

const CompanyDispatcher: React.FC = () => {
  return <CompanyProfile />;
};

const CandidatesDispatcher: React.FC = () => {
  return <CandidateSearch />;
};

// Simple helper to load the dashboard according to user role
const DashboardHomeDispatcher: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'recruiter':
      return <RecruiterDashboard />;
    case 'placement_officer':
      return <PODashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Route protection wrapper
const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Dashboard Scope */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* Dispatcher loads specific home view depending on role */}
          <Route index element={<DashboardHomeDispatcher />} />

          {/* Role Specific Routes */}
          <Route path="profile" element={<StudentProfile />} />
          <Route path="jobs" element={<JobsDispatcher />} />
          <Route path="applications" element={<ApplicationsDispatcher />} />
          <Route path="drives" element={<StudentDrives />} />
          <Route path="interviews" element={<StudentInterviews />} />
          <Route path="offers" element={<StudentOffers />} />
          <Route path="company" element={<CompanyDispatcher />} />
          <Route path="companies" element={<DashboardHomeDispatcher />} />
          <Route path="candidates" element={<CandidatesDispatcher />} />
          <Route path="bulk-email" element={<DashboardHomeDispatcher />} />
          <Route path="reports" element={<DashboardHomeDispatcher />} />
          <Route path="users" element={<DashboardHomeDispatcher />} />
          <Route path="settings" element={<Settings />} />
          <Route path="resume-builder" element={<ResumeBuilder />} />
          <Route path="audit" element={<DashboardHomeDispatcher />} />
          <Route path="health" element={<DashboardHomeDispatcher />} />
          <Route path="notifications" element={<DashboardHomeDispatcher />} />
          <Route path="announcements" element={<DashboardHomeDispatcher />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;

