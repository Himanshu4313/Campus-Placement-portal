import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { toast } from 'react-hot-toast';
import { GraduationCap, Mail, Lock, User, Briefcase } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

const registerSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: zod.enum(['student', 'recruiter', 'placement_officer']),
});

type RegisterFormValues = zod.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'recruiter' | 'placement_officer'>('student');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const handleRoleChange = (role: 'student' | 'recruiter' | 'placement_officer') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', values);
      toast.success('Registration successful! Please check your email for the verification OTP.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
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
            <GraduationCap className="h-9 w-9 text-primary" />
            <span className="text-white">Placement Hub</span>
          </Link>
          <p className="text-sm text-slate-400">Create your new portal account</p>
        </div>

        <Card className="p-8 border border-slate-900 bg-slate-950/80 backdrop-blur-md shadow-premium">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Role Selection Tabs */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Choose Role</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800">
                {(['student', 'recruiter', 'placement_officer'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleChange(role)}
                    className={`py-2 px-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                      selectedRole === role
                        ? 'bg-primary text-white shadow-premium'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <Input
              type="text"
              label="Full Name"
              placeholder="John Doe"
              icon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

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

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Register
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
