import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Wallet, Mail, Lock, User, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Label } from '../components/ui/Input';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Toast / status
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  // Activation modal state
  const [activationStatus, setActivationStatus] = useState<{ ok: boolean; msg?: string } | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.has('activated')) {
      const ok = searchParams.get('activated') === 'true';
      setActivationStatus({ ok, msg: searchParams.get('error') || undefined });
      searchParams.delete('activated');
      searchParams.delete('error');
      setSearchParams(searchParams);
    } else if (searchParams.has('resetToken')) {
      setResetToken(searchParams.get('resetToken'));
      searchParams.delete('resetToken');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.login({ email, password });
      await login(res.token);
      navigate('/');
    } catch (err: any) {
      setMessage({ text: err.message || 'Invalid email or password.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSsoLogin = async (provider: string) => {
    try {
      const redirectUri = window.location.origin + '/auth/callback';
      const res = await api.getSsoUrl(provider, redirectUri);
      window.location.href = res.url;
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to initialize SSO login.', type: 'error' });
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.register({ fullName, email, password, profileImageUrl: profileImageUrl || undefined });
      setMessage({ text: 'Account created. Please check your email to activate your account.', type: 'success' });
      setIsLogin(true);
    } catch (err: any) {
      setMessage({ text: err.message || 'Registration failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.forgotPassword({ email });
      setMessage({ text: 'Password reset link sent to the email.', type: 'success' });
      setShowForgot(false);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to send reset link.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;
    setLoading(true);
    setMessage(null);
    try {
      await api.resetPassword({ token: resetToken, password: newPassword });
      setMessage({ text: 'Password reset successfully. You can now log in.', type: 'success' });
      setResetToken(null);
    } catch (err: any) {
      setMessage({ text: err.message || 'Password reset failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-4">
      {/* Brand logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
          <Wallet className="w-5 h-5" />
        </div>
        <span className="font-semibold text-text-primary text-xl tracking-tight">ExpenseHub</span>
      </div>

      <Card className="w-full max-w-md p-6 lg:p-8">
        {/* Status Message alert */}
        {message && (
          <div
            className={`mb-6 p-3.5 rounded-[6px] text-[13px] border flex items-start space-x-2.5 ${
              message.type === 'success'
                ? 'bg-accent-subtle border-accent/20 text-accent'
                : 'bg-red-50 border-negative/20 text-negative'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {resetToken ? (
          /* Reset Password Form */
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary mb-1">Set new password</h2>
            <p className="text-xs text-text-secondary mb-4">Enter a new password for your account.</p>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9"
                />
                <Lock className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        ) : showForgot ? (
          /* Forgot Password Form */
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary mb-1">Reset password</h2>
            <p className="text-xs text-text-secondary mb-4">
              Enter your email address and we'll send you a password reset link.
            </p>
            <div>
              <Label htmlFor="forgot-email">Email address</Label>
              <div className="relative">
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="pl-9"
                />
                <Mail className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowForgot(false)} className="w-1/2">
                Back
              </Button>
              <Button type="submit" disabled={loading} className="w-1/2">
                {loading ? 'Sending...' : 'Send link'}
              </Button>
            </div>
          </form>
        ) : isLogin ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Sign in</h2>
              <p className="text-xs text-text-secondary">Enter your credentials to access your financial dashboard.</p>
            </div>
            <div>
              <Label htmlFor="login-email">Email address</Label>
              <div className="relative">
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="pl-9"
                />
                <Mail className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[12px] text-accent hover:underline font-medium mb-1 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9"
                />
                <Lock className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign in'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface px-2 text-text-tertiary">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" onClick={() => handleSsoLogin('google')} className="w-full flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Google
              </Button>
              <Button type="button" variant="secondary" onClick={() => handleSsoLogin('microsoft')} className="w-full flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#7fba00" d="M13 1h10v10H13z"/>
                  <path fill="#00a4ef" d="M1 13h10v10H1z"/>
                  <path fill="#ffb900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-text-secondary">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setMessage(null); }}
                  className="text-accent hover:underline font-medium cursor-pointer"
                >
                  Create account
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Create an account</h2>
              <p className="text-xs text-text-secondary">Start tracking your income and expenses efficiently.</p>
            </div>
            <div>
              <Label htmlFor="register-name">Full name</Label>
              <div className="relative">
                <Input
                  id="register-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="pl-9"
                />
                <User className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
              </div>
            </div>
            <div>
              <Label htmlFor="register-email">Email address</Label>
              <div className="relative">
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="pl-9"
                />
                <Mail className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
              </div>
            </div>
            <div>
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9"
                />
                <Lock className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
              </div>
            </div>
            <div>
              <Label htmlFor="register-avatar">Profile Image URL (optional)</Label>
              <Input
                id="register-avatar"
                type="url"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create account'}
            </Button>
            <div className="text-center pt-2">
              <p className="text-xs text-text-secondary">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setMessage(null); }}
                  className="text-accent hover:underline font-medium cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        )}
      </Card>

      {/* Activation Status Modal */}
      {activationStatus && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6 text-center space-y-4 bg-surface shadow-lg">
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                activationStatus.ok ? 'bg-accent-subtle text-accent' : 'bg-red-50 text-negative'
              }`}
            >
              {activationStatus.ok ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-base">
                {activationStatus.ok ? 'Account activated' : 'Activation failed'}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {activationStatus.ok
                  ? 'Your email is verified. You can now sign in.'
                  : activationStatus.msg || 'Invalid or expired activation link.'}
              </p>
            </div>
            <Button onClick={() => setActivationStatus(null)} className="w-full">
              Dismiss
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
