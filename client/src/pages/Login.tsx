import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { toast } from 'react-hot-toast';
import { GraduationCap, Mail, Lock } from 'lucide-react';
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
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', values);
      const { user, accessToken } = res.data.data;

      // Update Redux state and cookies/localStorage
      dispatch(loginSuccess({ user, accessToken }));

      // Initialize Socket connection
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
            <GraduationCap className="h-9 w-9 text-primary animate-pulse" />
            <span className="text-white">Placement Hub</span>
          </Link>
          <p className="text-sm text-slate-400">Sign in to your placement profile</p>
        </div>

        <Card className="p-8 border border-slate-900 bg-slate-950/80 backdrop-blur-md shadow-premium">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              type="email"
              label="Email Address"
              placeholder="name@university.edu"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-800 bg-slate-900 text-primary focus:ring-primary focus:ring-offset-slate-950" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
