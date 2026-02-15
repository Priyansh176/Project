import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthCard } from '@/components/AuthCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Login() {
  const [emailOrRoll, setEmailOrRoll] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailOrRoll.trim() || !password) {
      setError('Enter email/roll number and password');
      return;
    }
    setLoading(true);
    try {
      await login(emailOrRoll.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]" />
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F5F7FB]">
        <AuthCard
          title="Course Allotment Portal"
          description="Sign in with your roll number or email"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email_or_roll">Roll No / Email</Label>
              <Input
                id="email_or_roll"
                type="text"
                placeholder="Roll number or email"
                value={emailOrRoll}
                onChange={(e) => setEmailOrRoll(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link to="/forgot-password" className="underline hover:text-foreground">
                Forgot password?
              </Link>
              {' · '}
              <Link to="/signup" className="underline hover:text-foreground">
                Sign up
              </Link>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
