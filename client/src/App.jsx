import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/student/StudentDashboard';
import FacultyDashboard from './components/faculty/FacultyDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import PrivateRoute from './components/common/PrivateRoute';
import ManageUsers from './components/admin/ManageUsers';
import ManageFaculties from './components/admin/ManageFaculties';
import SystemSettings from './components/admin/SystemSettings';
import BookAppointment from './components/student/BookAppointment';
import MyAppointments from './components/student/MyAppointments';
import FacultyAppointments from './components/faculty/FacultyAppointments';
import ManageSchedule from './components/faculty/ManageSchedule';
import AdminContactMessages from './components/admin/AdminContactMessages';
import UserContactMessages from './components/user/UserContactMessages';
import UserProfile from './components/user/UserProfile';
import AnimatedBackground from './components/ui/AnimatedBackground';
import ErrorBoundary from './components/common/ErrorBoundary';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col relative bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-primary-500 selection:text-white transition-colors duration-300">
            <AnimatedBackground />
            <Navbar />
            <main className="flex-grow relative z-10 pt-16 md:pt-20">
              <ErrorBoundary>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Student Routes */}
                  <Route path="/student/dashboard" element={
                    <PrivateRoute role="student"><StudentDashboard /></PrivateRoute>
                  } />
                  <Route path="/student/book-appointment" element={
                    <PrivateRoute role="student"><BookAppointment /></PrivateRoute>
                  } />
                  <Route path="/student/my-appointments" element={
                    <PrivateRoute role="student"><MyAppointments /></PrivateRoute>
                  } />
                  
                  {/* Faculty Routes */}
                  <Route path="/faculty/dashboard" element={
                    <PrivateRoute role="faculty"><FacultyDashboard /></PrivateRoute>
                  } />
                  <Route path="/faculty/appointments" element={
                    <PrivateRoute role="faculty"><FacultyAppointments /></PrivateRoute>
                  } />
                  <Route path="/faculty/manage-schedule" element={
                    <PrivateRoute role="faculty"><ManageSchedule /></PrivateRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={
                    <PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>
                  } />
                  <Route path="/admin/manage-users" element={
                    <PrivateRoute role="admin"><ManageUsers /></PrivateRoute>
                  } />
                  <Route path="/admin/manage-faculties" element={
                    <PrivateRoute role="admin"><ManageFaculties /></PrivateRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <PrivateRoute role="admin"><SystemSettings /></PrivateRoute>
                  } />
                  <Route path="/admin/contact-messages" element={
                    <PrivateRoute role="admin"><AdminContactMessages /></PrivateRoute>
                  } />
                  
                  {/* ✅ User Routes - Message icon redirects here */}
                  <Route path="/user/messages" element={
                    <PrivateRoute><UserContactMessages /></PrivateRoute>
                  } />
                  <Route path="/user/profile" element={
                    <PrivateRoute><UserProfile /></PrivateRoute>
                  } />
                  
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </ErrorBoundary>
            </main>
            <Footer />
            <ToastContainer 
              position="bottom-right"
              toastClassName="rounded-xl shadow-card border border-primary-500/10"
              progressClassName="bg-primary-500"
            />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;