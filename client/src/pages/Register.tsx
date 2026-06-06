import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Droplets, Sprout, ShieldCheck, BarChart3 } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
});

export default function Register() {
  const [, navigate] = useLocation();
  const { register, registerIsPending, login, refetchUser } = useAuth();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    register(values, {
      onSuccess: () => {
        login(
          { username: values.username, password: values.password },
          {
            onSuccess: async () => {
              await refetchUser();
              navigate('/');
            },
          }
        );
      },
    });
  }

  const features = [
    { icon: Droplets, label: 'Water Quality', desc: 'Real-time pH & TDS monitoring', color: 'text-blue-400' },
    { icon: Sprout, label: 'Smart Irrigation', desc: 'AI-powered crop recommendations', color: 'text-emerald-400' },
    { icon: BarChart3, label: 'Analytics', desc: 'Detailed reports & insights', color: 'text-amber-400' },
    { icon: ShieldCheck, label: 'Alerts', desc: 'Instant issue notifications', color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-blue-950 to-blue-900 flex-col justify-between p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">JalSetu</span>
          </div>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Join thousands of<br />smart farmers
            </h2>
            <p className="text-emerald-200 text-lg leading-relaxed">
              Start optimizing your water usage today with AI-driven insights and real-time monitoring.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.label} className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <f.icon className={`h-5 w-5 ${f.color} mb-2`} />
                <div className="text-sm font-semibold text-white">{f.label}</div>
                <div className="text-xs text-emerald-200 mt-0.5">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-emerald-300 text-sm">
          © 2026 JalSetu • Smart Irrigation Platform
        </div>
      </div>

      {/* Right panel - register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-950 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">JalSetu</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
            <p className="text-gray-400">Start your smart farming journey</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm font-medium">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Aarav"
                          className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-11 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm font-medium">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dixit"
                          className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-11 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm font-medium">Username <span className="text-red-400">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your_username"
                        className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-11 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-11 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                    <FormLabel className="text-gray-300 text-sm font-medium">Password <span className="text-red-400">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-11 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-12 mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] border-0"
                disabled={registerIsPending}
              >
                {registerIsPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <span className="text-gray-500 text-sm">Already have an account? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
