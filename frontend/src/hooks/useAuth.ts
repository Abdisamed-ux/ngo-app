import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuthStore } from '../stores/authStore.js';
import type { User, Role } from '../types/index.js';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  phone?: string;
}

interface AuthResponse {
  user: { id: string; email: string; role: Role; full_name: string };
  accessToken: string;
}

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => {
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        fullName: data.user.full_name,
      };
      setAuth(user, data.accessToken);
      navigate('/dashboard');
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/register', payload);
      return data;
    },
    onSuccess: (data) => {
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        fullName: data.user.full_name,
      };
      setAuth(user, data.accessToken);
      navigate('/dashboard');
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      logout();
      navigate('/login');
    },
  });
};
