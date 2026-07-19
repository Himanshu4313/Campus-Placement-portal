import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { toast } from 'react-hot-toast';
import { GraduationCap, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { loginSuccess } from '../store/authSlice';
import api from '../services/api';
import { initiateSocket } from '../services/socket';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(1, 'Password is required'),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleSocialLogin = (platform: string) => {
    toast.loading(`OAuth setup pending on server. Auto-filling demo credentials...`, { duration: 2500 });
    setValue('email', 'rohit@gmail.com');
    setValue('password', 'Password123');
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', values);
      const { user, accessToken } = res.data.data;

      dispatch(loginSuccess({ user, accessToken }));
      initiateSocket(accessToken);

      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full animate-in fade-in duration-300">
      
      {/* Left side: Login Form */}
      <div className="w-full md:w-[45%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-white dark:bg-card border-r border-border/60">
        <div className="w-full max-w-md mx-auto flex flex-col gap-8">
          
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-2 self-start">
              <GraduationCap className="h-7 w-7 text-primary" />
              <span className="text-foreground">PlacementHub</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your placement profile account</p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg bg-card hover:bg-muted text-sm font-semibold transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google
            </button>
            <button 
              type="button"
              onClick={() => handleSocialLogin('GitHub')}
              className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg bg-card hover:bg-muted text-sm font-semibold transition-colors"
            >
              <svg className="h-4 w-4 fill-foreground" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute w-full border-t border-border/80"></div>
            <span className="relative px-3 bg-white dark:bg-card text-xs text-muted-foreground uppercase font-bold tracking-wider">Or continue with</span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="name@university.edu"
              icon={<Mail className="h-4 w-4 text-muted-foreground/60" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4 text-muted-foreground/60" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border bg-muted text-primary focus:ring-primary focus:ring-offset-background" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full mt-2 py-6 text-sm" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* Right side: Image / Visual Feature showcase */}
      <div className="hidden md:flex flex-1 bg-slate-50 dark:bg-background items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none opacity-60 dark:opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-md flex flex-col gap-6 text-center md:text-left z-10">
          <Card className="p-6 border border-border shadow-lg flex flex-col gap-4 bg-white dark:bg-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Automated Resume Matching</h3>
                <p className="text-xs text-muted-foreground">Instant ATS compliance checks</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify your metrics against active job postings. Our unified campus parser guarantees recruiter visibility by checking alignment parameters automatically.
            </p>
          </Card>

          <Card className="p-6 border border-border shadow-lg flex flex-col gap-4 bg-white dark:bg-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Real-time Interview Tracking</h3>
                <p className="text-xs text-muted-foreground">Synchronized video coordinates</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Join online video rounds directly from your schedule and check calendar stages with read/unread statuses.
            </p>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default Login;
