import { useState } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-20 transition-colors duration-300">
      {/* Decorative top background pattern */}
      <div className="absolute top-0 left-0 right-0 h-56 overflow-hidden z-0 opacity-40">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary opacity-10 animate-pulse"></div>
        <div className="absolute top-20 -left-10 w-36 h-36 rounded-full bg-secondary opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <header className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 h-8 w-8" 
                onClick={() => navigate('/settings')}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-200" />
              </Button>
              Edit Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-10">Update your personal information</p>
          </div>
        </div>
      </header>
      
      <main className="flex-1 px-5 pt-4 pb-28 overflow-y-auto z-10">
        <div className="space-y-6">
          <Card className="rounded-3xl shadow-lg overflow-hidden border-0 scale-in">
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center p-1 mb-4">
                  <div className="h-full w-full rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user?.username}</h2>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}