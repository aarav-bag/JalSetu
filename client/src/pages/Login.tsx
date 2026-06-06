import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Droplets, Sprout, Wind, Thermometer } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function Login() {
  const [, navigate] = useLocation();
  const { login, loginIsPending, refetchUser } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    login(values, {
      onSuccess: async () => {
        await refetchUser();
        navigate('/');
      }
    });
  }

  const stats = [
    { icon: Droplets, label: 'Water Saved', value: '40%', color: 'text-blue-400' },
    { icon: Sprout, label: 'Crop Yield', value: '+28%', color: 'text-green-400' },
    { icon: Thermometer, label: 'Monitoring', value: '24/7', color: 'text-amber-400' },
    { icon: Wind, label: 'Farms Active', value: '1.2K', color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-emerald-900 flex-col justify-between p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">JalSetu</span>
          </div>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Smart irrigation<br />for modern farmers
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              Real-time soil moisture, water quality monitoring, and AI-powered crop recommendations — all in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-blue-300 text-sm">
          © 2026 JalSetu • Smart Irrigation Platform
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">JalSetu</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Sign in to your dashboard</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm font-medium">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your username"
                        className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-12 mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] border-0"
                disabled={loginIsPending}
              >
                {loginIsPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <span className="text-gray-500 text-sm">Don't have an account? </span>
            <button
              onClick={() => navigate('/register')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Create one
            </button>
          </div>

          <div className="mt-10 p-4 bg-gray-900 rounded-2xl border border-gray-800">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Demo credentials</p>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="text-sm text-gray-300 font-mono">aarav</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Password</p>
                <p className="text-sm text-gray-300 font-mono">123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
