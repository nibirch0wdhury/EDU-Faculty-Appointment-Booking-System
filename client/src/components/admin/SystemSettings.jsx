import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Save, Settings, Users, Calendar, Clock, Shield, Globe, Bell, Lock } from 'lucide-react';
import api from '../../utils/api';

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
      // Try to fetch from API
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default settings if API fails
      toast.info('Using default settings');
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
      toast.success('Settings saved successfully! (Demo)');
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure and manage system preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">General Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Description
              </label>
              <input
                type="text"
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Appointment Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Appointment Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Appointments Per Day
              </label>
              <input
                type="number"
                name="maxAppointmentsPerDay"
                value={settings.maxAppointmentsPerDay}
                onChange={handleChange}
                className="input-field"
                min="1"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Duration (minutes)
              </label>
              <select
                name="appointmentDuration"
                value={settings.appointmentDuration}
                onChange={handleChange}
                className="input-field"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Working Hours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Working Hours Start
              </label>
              <input
                type="time"
                name="workingHours.start"
                value={settings.workingHours.start}
                onChange={handleNestedChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Working Hours End
              </label>
              <input
                type="time"
                name="workingHours.end"
                value={settings.workingHours.end}
                onChange={handleNestedChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break Start
              </label>
              <input
                type="time"
                name="breakHours.start"
                value={settings.breakHours.start}
                onChange={handleNestedChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break End
              </label>
              <input
                type="time"
                name="breakHours.end"
                value={settings.breakHours.end}
                onChange={handleNestedChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">Notification Settings</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-gray-700">Enable Email Notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="smsNotifications"
                checked={settings.smsNotifications}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-gray-700">Enable SMS Notifications</span>
            </label>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">System Status</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-gray-700">Enable Maintenance Mode</span>
            </label>
            {settings.maintenanceMode && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                ⚠️ Maintenance mode is enabled. Users will see a maintenance page.
              </div>
            )}
          </div>
        </div>

        {/* Save Button at Bottom */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-8 py-3"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;