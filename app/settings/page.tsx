'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Settings, Bell, Lock, User, Mail, Save } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: 'Sales Team',
    email: 'sales@leadflow.com',
    notifications: true,
    emailDigest: 'weekly',
    dataExport: false,
  })

  const [activeTab, setActiveTab] = useState('profile')

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200">
        {[
          { id: 'profile', label: 'Profile Settings', icon: User },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security', icon: Lock },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-6 py-4 border-b-2 font-medium transition-all ${
              activeTab === id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="floating-card p-8 rounded-xl max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="floating-card p-8 rounded-xl max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Notification Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-900">Email Notifications</h3>
                <p className="text-sm text-slate-600">Receive notifications about lead updates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Digest</label>
              <select
                value={settings.emailDigest}
                onChange={(e) => setSettings({ ...settings, emailDigest: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="floating-card p-8 rounded-xl max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Security Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
              <input
                type="password"
                placeholder="Enter your current password"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
              <input
                type="password"
                placeholder="Enter your new password"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your new password"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              <Save size={18} />
              Update Password
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
