import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Image, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';

export function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();

  const [fullName, setFullName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setProfileImageUrl(user.profileImageUrl || '');
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload: any = { fullName, profileImageUrl: profileImageUrl || null };
    if (password) payload.password = password;

    try {
      await api.updateMe(payload);
      await refreshUser();
      setPassword('');
      setMessage({ text: 'Profile updated successfully.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.deleteMe();
      logout();
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  const defaultAvatar = user
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=EAF3EE&color=1A5F3F&size=160`
    : '';

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Account Settings</h2>
        <p className="text-xs text-text-secondary">Manage your personal profile and account credentials.</p>
      </div>

      <Card className="p-6">
        {/* User Overview Header */}
        <div className="flex items-center space-x-4 pb-6 mb-6 border-b border-border">
          <img
            src={profileImageUrl || defaultAvatar}
            alt={fullName}
            className="w-16 h-16 rounded-full border border-border object-cover bg-hover-row"
          />
          <div>
            <h3 className="font-semibold text-text-primary text-base">{user?.fullName}</h3>
            <p className="text-xs text-text-secondary">{user?.email}</p>
          </div>
        </div>

        {/* Success / Error Toast alert */}
        {message && (
          <div
            className={`mb-6 p-3 rounded-[6px] text-xs border flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-accent-subtle border-accent/20 text-accent'
                : 'bg-red-50 border-negative/20 text-negative'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="profile-fullName">Full Name</Label>
            <div className="relative">
              <Input
                id="profile-fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-9"
              />
              <User className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <Label htmlFor="profile-email">Email Address</Label>
            <div className="relative">
              <Input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="pl-9 bg-hover-row cursor-not-allowed text-text-secondary"
              />
              <Mail className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-text-tertiary mt-1">Email address cannot be changed.</p>
          </div>

          <div>
            <Label htmlFor="profile-avatar">Avatar Image URL</Label>
            <div className="relative">
              <Input
                id="profile-avatar"
                type="url"
                placeholder="https://example.com/avatar.png"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                className="pl-9"
              />
              <Image className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <Label htmlFor="profile-password">New Password (leave blank to keep current)</Label>
            <div className="relative">
              <Input
                id="profile-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
              />
              <Lock className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border border-red-200 dark:border-red-900/40">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-600 dark:text-red-400 text-sm">Danger Zone</h3>
            <p className="text-xs text-text-secondary mt-1">
              Permanently delete your account and all associated data including transactions, categories, and goals.
              <strong className="text-text-primary"> This action cannot be undone.</strong>
            </p>
            <button
              id="delete-account-btn"
              onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(null); }}
              className="mt-3 flex items-center space-x-1.5 text-xs font-medium text-red-500 hover:text-red-600 border border-red-300 dark:border-red-700 hover:border-red-400 px-3 py-1.5 rounded-[6px] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete my account</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Delete Account</h3>
                <p className="text-xs text-text-secondary">This is permanent and irreversible.</p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs text-red-700 dark:text-red-300 space-y-1">
              <p>Deleting your account will permanently remove:</p>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>All income and expense transactions</li>
                <li>All categories and savings goals</li>
                <li>Your profile and login credentials</li>
              </ul>
            </div>

            <div>
              <Label htmlFor="delete-confirm-input">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input
                id="delete-confirm-input"
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>

            {deleteError && (
              <p className="text-xs text-red-500">{deleteError}</p>
            )}

            <div className="flex space-x-3 pt-1">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-sm border border-border rounded-[6px] text-text-secondary hover:bg-hover-row transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                className="flex-1 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-[6px] font-medium transition-colors"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

