/*
 ** EPITECH PROJECT, 2026
 ** Area-miror
 ** File description:
 ** api.ts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AreaPayload {
  name: string;
  action_provider: string;
  action_id: string;
  action_params: Record<string, any>;
  reaction_provider: string;
  reaction_id: string;
  reaction_params: Record<string, any>;
}

export const getBaseUrl = async (): Promise<string> => {
  try {
    const ip = await AsyncStorage.getItem('server_ip');
    const port = await AsyncStorage.getItem('server_port');

    if (!ip) return 'http://localhost:8080';
    if (ip.startsWith('http')) return ip;
    if (!port) return `http://${ip}:8080`;
    return `http://${ip}:${port}`;
  } catch {
    return 'http://localhost:8080';
  }
};

export const apiCall = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: unknown
): Promise<ApiResponse<T>> => {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const token = await AsyncStorage.getItem('user_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Erreur ${response.status}`);
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
};

export const login = async (email: string, password: string) => {
  return apiCall('/api/auth/login', 'POST', { email, password });
};

export const register = async (email: string, password: string, name: string) => {
  return apiCall('/api/auth/register', 'POST', { email, password, name });
};

export const fetchAbout = async () => {
  return apiCall('/about.json', 'GET');
};

export const createArea = async (payload: AreaPayload) => {
  return apiCall('/api/areas', 'POST', {
    name: payload.name,
    description: 'Créé depuis le mobile',
    actionService: payload.action_provider,
    actionType: payload.action_id,
    actionConfig: payload.action_params,
    reactionService: payload.reaction_provider,
    reactionType: payload.reaction_id,
    reactionConfig: payload.reaction_params,
  });
};

export const getUserAreas = async () => {
  return apiCall('/api/areas', 'GET');
};

export const deleteArea = async (id: string) => {
  return apiCall(`/api/areas/${id}`, 'DELETE');
};

export const logoutUser = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem('user_token');
    return true;
  } catch {
    return false;
  }
};

export const getConnectedAccounts = async () => {
  return apiCall('/api/user/oauth-accounts', 'GET');
};

export const getAuthUrl = async (provider: string): Promise<string> => {
  const baseUrl = await getBaseUrl();
  let redirectUrl = Linking.createURL('/login/success');

  if (redirectUrl.startsWith('exp://') && !redirectUrl.includes('/--/')) {
    redirectUrl = redirectUrl.replace(/exp:\/\/([^/]+)\/(.*)/, 'exp://$1/--/$2');
  }

  const token = await AsyncStorage.getItem('user_token');
  const stateData = JSON.stringify({
    redirect: redirectUrl,
    userToken: token,
  });

  return `${baseUrl}/api/auth/${provider}?state=${encodeURIComponent(stateData)}`;
};
