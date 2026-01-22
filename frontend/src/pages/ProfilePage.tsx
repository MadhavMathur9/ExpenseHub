import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Image, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
    </div>
  );
}
