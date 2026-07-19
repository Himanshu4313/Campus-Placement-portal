import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTheme } from '../hooks/useTheme';
import { updateUserSuccess } from '../store/authSlice';
import { User, Lock, Bell, Palette, Loader2, Globe } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();

  // Profile Form States
  const [name, setName] = useState((user as any)?.name || '');
  const [phone, setPhone] = useState((user as any)?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Preferences Toggles
  const [emailNotifications, setEmailNotifications] = useState((user as any)?.preferences?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState((user as any)?.preferences?.pushNotifications ?? true);
  const [language, setLanguage] = useState((user as any)?.preferences?.language ?? 'en');
  const [updatingPref, setUpdatingPref] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      dispatch(updateUserSuccess(res.data.data));
      toast.success('Account profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSavePreferences = async (newTheme: 'light' | 'dark', email = emailNotifications, push = pushNotifications, lang = language) => {
    setTheme(newTheme);
    setUpdatingPref(true);
    try {
      const res = await api.put('/auth/preferences', {
        preferences: {
          theme: newTheme,
          emailNotifications: email,
          pushNotifications: push,
          language: lang
        }
      });
      dispatch(updateUserSuccess(res.data.data));
      toast.success('Preferences saved');
    } catch (error: any) {
      console.error('Failed to sync settings on database', error);
    } finally {
      setUpdatingPref(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pb-10 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure account details, update credentials, notifications, and visual styling.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left sidebar indicators */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <a href="#profile" className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <User className="h-4.5 w-4.5" /> Account Details
          </a>
          <a href="#security" className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Lock className="h-4.5 w-4.5" /> Authentication & Keys
          </a>
          <a href="#notifications" className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Bell className="h-4.5 w-4.5" /> System Notifications
          </a>
          <a href="#theme" className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Palette className="h-4.5 w-4.5" /> Visual Layout Theme
          </a>
        </div>

        {/* Right side form cards */}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          {/* Account Details */}
          <Card id="profile" className="p-6 flex flex-col gap-5 bg-white dark:bg-card">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-3">
              <User className="h-5 w-5 text-primary" /> Profile Settings
            </h2>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
              <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
              <Input label="System Email Address" value={user?.email || ''} disabled />
              <Button type="submit" disabled={updatingProfile} className="self-end mt-2">
                {updatingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                Save Profile
              </Button>
            </form>
          </Card>

          {/* Authentication Credentials */}
          <Card id="security" className="p-6 flex flex-col gap-5 bg-white dark:bg-card">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-3">
              <Lock className="h-5 w-5 text-primary" /> Password Details
            </h2>
            <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
              <Input type="password" label="Current Security Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
              <Input type="password" label="New Security Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <Button type="submit" disabled={updatingPassword} className="self-end mt-2">
                {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                Update Password
              </Button>
            </form>
          </Card>

          {/* Notification toggles */}
          <Card id="notifications" className="p-6 flex flex-col gap-5 bg-white dark:bg-card">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-3">
              <Bell className="h-5 w-5 text-primary" /> Broadcast Notifications
            </h2>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">System Email Communications</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Receive job alerts, calendar notifications directly.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailNotifications} 
                  onChange={e => {
                    setEmailNotifications(e.target.checked);
                    handleSavePreferences(theme, e.target.checked, pushNotifications, language);
                  }}
                  className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
                />
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <div>
                  <h4 className="font-bold text-sm">Real-time Push Alerts</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Show notifications when updates or new interview rounds are scheduled.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={pushNotifications} 
                  onChange={e => {
                    setPushNotifications(e.target.checked);
                    handleSavePreferences(theme, emailNotifications, e.target.checked, language);
                  }}
                  className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
                />
              </div>
            </div>
          </Card>

          {/* Theme Settings */}
          <Card id="theme" className="p-6 flex flex-col gap-5 bg-white dark:bg-card">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-3">
              <Palette className="h-5 w-5 text-primary" /> Visual Layout Theme
            </h2>
            <div className="grid grid-cols-2 gap-4 py-2">
              <button 
                type="button"
                onClick={() => handleSavePreferences('light')}
                className={`p-4 rounded-xl border flex flex-col gap-2 items-center justify-center transition-all ${
                  theme === 'light' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="h-8 w-12 bg-slate-100 border border-slate-300 rounded shadow-sm flex items-center justify-center text-xs">Light</span>
                <span className="text-xs font-semibold">Light Mode</span>
              </button>

              <button 
                type="button"
                onClick={() => handleSavePreferences('dark')}
                className={`p-4 rounded-xl border flex flex-col gap-2 items-center justify-center transition-all ${
                  theme === 'dark' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="h-8 w-12 bg-zinc-950 border border-zinc-800 rounded shadow-sm flex items-center justify-center text-xs text-zinc-400">Dark</span>
                <span className="text-xs font-semibold">Dark Mode</span>
              </button>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default Settings;
