import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { LoginCredentials } from '@/types/auth';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/config/routes';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { showErrorMessage, showSuccessMessage } = useToast();

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
    mutationFn: async (options?: { redirectToHome?: boolean; redirectToLogin?: boolean }) => {
      authService.logout();
      return options;
    },
    onSuccess: (options) => {
      queryClient.clear();
      showSuccessMessage('Logged out successfully');
      if (options?.redirectToLogin) {
        window.location.href = ROUTES.LOGIN;
        return;
      }
      window.location.href = options?.redirectToHome === false ? ROUTES.LOGIN : ROUTES.HOME;
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