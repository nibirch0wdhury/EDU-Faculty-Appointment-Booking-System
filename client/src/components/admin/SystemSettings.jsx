import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Save, Settings, Calendar, Clock, Bell, Shield, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import PageTransition, { MotionContainer } from '../ui/PageTransition';
import AdminNavTabs from './AdminNavTabs';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'EDU Appointment System',
    siteDescription: 'Faculty appointment booking system for East Delta University',
    maxAppointmentsPerDay: 10,
    appointmentDuration: 30,
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    breakHours: {
      start: '13:00',
      end: '14:00',
    },
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.success('Settings saved successfully!');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    setSettings({
      ...settings,
      [parent]: {
        ...settings[parent],
        [child]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots min-h-screen">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 dark:border-primary-400 border-t-transparent"></div>
        <span>Loading system preferences...</span>
      </div>
    );
  }

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <AdminNavTabs />
        <MotionContainer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
              <span>Platform Configuration</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">System Settings</h1>
          </div>
          <MagneticButton variant="primary" onClick={handleSave} disabled={saving} className="py-2.5 px-6 text-xs shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </MagneticButton>
        </MotionContainer>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Settings */}
          <MotionContainer delay={0.1} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 space-y-4 transition-all duration-300">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Settings className="w-5 h-5 text-primary-500 dark:text-primary-400" />
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">General Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Site Name</label>
                <input type="text" name="siteName" value={settings.siteName} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Site Description</label>
                <input type="text" name="siteDescription" value={settings.siteDescription} onChange={handleChange} className="input-field" />
              </div>
            </div>
          </MotionContainer>

          {/* Appointment Settings */}
          <MotionContainer delay={0.2} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 space-y-4 transition-all duration-300">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Calendar className="w-5 h-5 text-primary-500 dark:text-primary-400" />
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Appointment Rules</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Max Appointments Per Day</label>
                <input type="number" name="maxAppointmentsPerDay" value={settings.maxAppointmentsPerDay} onChange={handleChange} className="input-field" min="1" max="50" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Slot Duration (Minutes)</label>
                <select name="appointmentDuration" value={settings.appointmentDuration} onChange={handleChange} className="input-field bg-white dark:bg-slate-900">
                  <option value="15" className="bg-white dark:bg-slate-900">15 Minutes</option>
                  <option value="30" className="bg-white dark:bg-slate-900">30 Minutes</option>
                  <option value="45" className="bg-white dark:bg-slate-900">45 Minutes</option>
                  <option value="60" className="bg-white dark:bg-slate-900">60 Minutes</option>
                </select>
              </div>
            </div>
          </MotionContainer>

          {/* Hours */}
          <MotionContainer delay={0.3} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 sm:p-8 space-y-4 transition-all duration-300">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Clock className="w-5 h-5 text-primary-500 dark:text-primary-400" />
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">University Working Hours</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Working Start</label>
                <input type="time" name="workingHours.start" value={settings.workingHours.start} onChange={handleNestedChange} className="input-field" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Working End</label>
                <input type="time" name="workingHours.end" value={settings.workingHours.end} onChange={handleNestedChange} className="input-field" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Break Start</label>
                <input type="time" name="breakHours.start" value={settings.breakHours.start} onChange={handleNestedChange} className="input-field" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Break End</label>
                <input type="time" name="breakHours.end" value={settings.breakHours.end} onChange={handleNestedChange} className="input-field" />
              </div>
            </div>
          </MotionContainer>

          {/* Notifications & Status */}
          <MotionContainer delay={0.4} className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 space-y-4 transition-all duration-300">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                <Bell className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Notifications</h2>
              </div>
              <div className="space-y-3 pt-1 text-xs">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 dark:bg-slate-800" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Enable Email Notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="smsNotifications" checked={settings.smsNotifications} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 dark:bg-slate-800" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Enable SMS Notifications</span>
                </label>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-6 space-y-4 transition-all duration-300">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                <Shield className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">System Status</h2>
              </div>
              <div className="space-y-3 pt-1 text-xs">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-red-500 focus:ring-red-500 dark:bg-slate-800" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Enable Maintenance Mode</span>
                </label>
                {settings.maintenanceMode && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
                    ⚠️ System is in Maintenance Mode. Non-admin users will be blocked.
                  </div>
                )}
              </div>
            </div>
          </MotionContainer>

          <div className="flex justify-end pt-4">
            <MagneticButton type="submit" disabled={saving} variant="primary" className="py-3 px-8 text-xs shadow-md shadow-primary-500/25 dark:shadow-primary-500/50">
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Preferences...' : 'Save All Settings'}</span>
            </MagneticButton>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default SystemSettings;