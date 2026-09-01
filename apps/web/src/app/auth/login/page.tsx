'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Shield, Megaphone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('from') || '/dashboard';
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      window.location.href = callbackUrl;
    } catch (error: any) {
      const code = error?.code || '';
      if (code.includes('wrong-password') || code.includes('invalid-credential') || code.includes('user-not-found')) {
        toast.error('Invalid email or password');
      } else if (code.includes('too-many-requests')) {
        toast.error('Too many failed attempts. Please try again later.');
      } else if (code.includes('user-disabled')) {
        toast.error('This account has been disabled.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      window.location.href = callbackUrl;
    } catch (error: any) {
      console.error('Google login failed:', error);
      toast.error('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const seedAdminEmail = process.env.NEXT_PUBLIC_SEED_ADMIN_EMAIL || '';

  const demoAccounts = [
    ...(seedAdminEmail ? [{ email: seedAdminEmail, label: 'Admin', icon: Shield, color: 'bg-[#0ef695]/10 text-[#0ef695]', desc: 'Full platform access' }] : []),
    { email: 'sarah@example.com', label: 'Fundraiser', icon: Megaphone, color: 'bg-purple-500/10 text-purple-400', desc: 'Create & manage campaigns' },
    { email: 'emily@example.com', label: 'Donor', icon: Heart, color: 'bg-blue-500/10 text-blue-400', desc: 'Donate & support causes' },
  ];

  const handleDemoLogin = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
    toast.info('Demo credentials filled. Click Log In to continue.');
  };

  return (
    <div>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        <p className="mt-2 text-sm text-white/55">
          Log in to your EasyFund account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...field}
              />
            )}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/reset-password" className="text-xs text-[#0ef695] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...field}
                />
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            'Log In'
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#060e1e] px-2 text-xs text-white/55">
          or continue with
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#060e1e] px-2 text-xs text-white/55">
          quick demo access
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {demoAccounts.map((demo) => (
          <button
            key={demo.email}
            type="button"
            onClick={() => handleDemoLogin(demo.email)}
            className="group rounded-xl border border-white/[0.08] bg-[#0c1828] p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#0ef695]/20 hover:shadow-[0_0_20px_rgba(14,246,149,0.08)]"
          >
            <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${demo.color} transition-transform duration-300 group-hover:scale-110`}>
              <demo.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-white">{demo.label}</p>
            <p className="mt-0.5 text-[10px] text-white/40">{demo.desc}</p>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-white/30">Password: password123 — Register these accounts first</p>

      <p className="mt-6 text-center text-sm text-white/55">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="font-medium text-[#0ef695] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
