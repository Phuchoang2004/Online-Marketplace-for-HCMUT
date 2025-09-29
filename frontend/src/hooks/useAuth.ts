import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { LoginCredentials } from '@/types/auth';
import { showErrorMessage, showSuccessMessage } from '@/utils/error';

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Get current user query
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
      showSuccessMessage('Login successful!');
    },
    onError: (error: Error) => {
      showErrorMessage(error.message);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
      showSuccessMessage('Logged out successfully');
      window.location.href = '/login';
    },
  });

  // Refresh token mutation
  const refreshMutation = useMutation({
    mutationFn: authService.refreshToken,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
    },
    onError: () => {
      authService.logout();
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    refreshToken: refreshMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
  };
};