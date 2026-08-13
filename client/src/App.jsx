import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
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

import AnimatedBackground from './components/ui/AnimatedBackground';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col relative text-slate-100 selection:bg-indigo-500 selection:text-white">
          <AnimatedBackground />
          <Navbar />
          <main className="flex-grow relative z-10">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Student Routes */}
              <Route path="/student/dashboard" element={
                <PrivateRoute role="student">
                  <StudentDashboard />
                </PrivateRoute>
              } />
              <Route path="/student/book-appointment" element={
                <PrivateRoute role="student">
                  <BookAppointment />
                </PrivateRoute>
              } />
              <Route path="/student/my-appointments" element={
                <PrivateRoute role="student">
                  <MyAppointments />
                </PrivateRoute>
              } />
              
              {/* Faculty Routes */}
              <Route path="/faculty/dashboard" element={
                <PrivateRoute role="faculty">
                  <FacultyDashboard />
                </PrivateRoute>
              } />
              <Route path="/faculty/appointments" element={
                <PrivateRoute role="faculty">
                  <FacultyAppointments />
                </PrivateRoute>
              } />
              <Route path="/faculty/manage-schedule" element={
                <PrivateRoute role="faculty">
                  <ManageSchedule />
                </PrivateRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } />
              <Route path="/admin/manage-users" element={
                <PrivateRoute role="admin">
                  <ManageUsers />
                </PrivateRoute>
              } />
              <Route path="/admin/manage-faculties" element={
                <PrivateRoute role="admin">
                  <ManageFaculties />
                </PrivateRoute>
              } />
              <Route path="/admin/settings" element={
                <PrivateRoute role="admin">
                  <SystemSettings />
                </PrivateRoute>
              } />
              <Route path="/admin/contact-messages" element={
                <PrivateRoute role="admin">
                  <AdminContactMessages />
                </PrivateRoute>
              } />
              
              {/* User Routes - Accessible by ALL logged-in users (Students, Faculty, Admin) */}
              <Route path="/user/messages" element={
                <PrivateRoute>
                  <UserContactMessages />
                </PrivateRoute>
              } />
              
              {/* 404 - Not Found */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;