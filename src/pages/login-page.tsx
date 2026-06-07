import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, isLoading, login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const from =
    (location.state as { from?: string } | null)?.from ?? '/';

  if (admin) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, var(--login-glow-1), transparent 40%), radial-gradient(circle at 80% 0%, var(--login-glow-2), transparent 35%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg, var(--login-overlay-start) 0%, var(--login-overlay-end) 100%)`,
        }}
      />

      <div className="relative z-10 flex min-h-svh items-center justify-center p-4 sm:p-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-sm bg-primary shadow-lg shadow-primary/20">
              <Dumbbell className="size-7 text-primary-foreground" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Crimson Forge
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Admin Access
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage your gym operations.
            </p>
          </div>

          <div className="rounded-sm bg-card p-6 shadow-sm ring-1 ring-primary/10 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/70" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 rounded-sm border-0 bg-primary/5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/70" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 rounded-sm border-0 bg-primary/5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
                  />
                </div>
              </div>

              {error ? (
                <p className="rounded-sm bg-primary/10 px-3 py-2 text-sm text-primary" role="alert">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 w-full rounded-sm bg-primary text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
