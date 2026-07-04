import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Loader2, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import PageShell from '@/components/PageShell';
import BottomNavigation from '@/components/BottomNavigation';

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
});

export default function EditProfile() {
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      return apiRequest(`/api/user/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      refetchUser();
      navigate('/settings');
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update your profile',
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: z.infer<typeof profileSchema>) {
    updateProfile.mutate(values);
  }

  return (
    <PageShell>
      <header className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="h-9 w-9 rounded-xl glass-tile flex items-center justify-center shadow-sm shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-white/70" />
          </button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Edit Profile</h1>
            <p className="text-sm page-subtitle font-medium mt-0.5">Update your personal information</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-2 pb-28 overflow-y-auto z-10">
        <div className="space-y-5">
          <div className="glass-card rounded-[1.5rem] p-6 relative overflow-hidden slide-in-right">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="flex flex-col items-center mb-6">
              <div className="h-20 w-20 rounded-2xl glass-tile flex items-center justify-center shadow-lg border-0 mb-3">
                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-blue-500/80 to-cyan-500/80 flex items-center justify-center">
                  <User className="h-9 w-9 text-white" />
                </div>
              </div>
              <h2 className="text-lg font-bold card-heading">{user?.username}</h2>
              <p className="text-xs card-muted mt-0.5">{user?.email}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold page-subtitle uppercase tracking-widest">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          className="glass-tile border-0 rounded-xl h-11 card-value"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold page-subtitle uppercase tracking-widest">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          className="glass-tile border-0 rounded-xl h-11 card-value"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold page-subtitle uppercase tracking-widest">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="glass-tile border-0 rounded-xl h-11 card-value"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="w-full mt-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg disabled:opacity-70"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </PageShell>
  );
}
