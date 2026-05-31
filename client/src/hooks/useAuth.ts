import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export type AuthUser = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt: string;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query to get the current authenticated user
  const { data: user, isLoading, isFetching, error, refetch } = useQuery<AuthUser>({
    queryKey: ['/api/user'],
    retry: false,
  });

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiRequest('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to log in',
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const register = useMutation({
    mutationFn: async (data: RegisterData) => {
      return apiRequest('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create account',
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to log out',
        variant: 'destructive',
      });
    },
  });

  return {
    user,
    isLoading: isLoading || isFetching,
    isAuthenticated: !!user,
    login: login.mutate,
    loginIsPending: login.isPending,
    register: register.mutate,
    registerIsPending: register.isPending,
    logout: logout.mutate,
    logoutIsPending: logout.isPending,
    refetchUser: refetch,
  };
}