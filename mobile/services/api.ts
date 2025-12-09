/*
 ** EPITECH PROJECT, 2025
 ** Area-miror
 ** File description:
 ** api
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

export const getBaseUrl = async () => {
  try {
    const ip = await AsyncStorage.getItem('server_ip');
    const port = await AsyncStorage.getItem('server_port');

    if (!ip) return 'http://localhost:8080';

    if (ip.startsWith('http')) {
      return ip;
    }

    if (!port) return `http://${ip}:8080`;
    return `http://${ip}:${port}`;
  } catch (error) {
    return 'http://localhost:8080';
  }
};

export const apiCall = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: any
) => {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = await AsyncStorage.getItem('user_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  console.log(`[API] ${method} ${url}`);

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Erreur ${response.status}`);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
};

export const fetchAbout = async () => {
  return apiCall('/about.json', 'GET');
};

export const createArea = async (
  actionProvider: string,
  actionId: string,
  reactionProvider: string,
  reactionId: string,
  params: any = {}
) => {
  return apiCall('/api/areas', 'POST', {
    name: params.name || `${actionProvider} ➜ ${reactionProvider}`,
    description: 'Créé depuis le mobile',

    actionService: actionProvider,
    actionType: actionId,
    actionConfig: params,

    reactionService: reactionProvider,
    reactionType: reactionId,
    reactionConfig: params,
  });
};

export const getUserAreas = async () => {
  return apiCall('/api/areas', 'GET');
};

export const deleteAutomation = async (id: string) => {
  try {
    const token = await AsyncStorage.getItem('user_token');

    const response = await fetch(`${API_URL}/api/areas/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la suppression');
    }

    return { success: true };
  } catch (error: any) {
    console.error('[API Error] Delete:', error.message);
    return { success: false, error: error.message };
  }
};

export const deleteArea = async (id: string) => {
  return apiCall(`/api/areas/${id}`, 'DELETE');
};

export const login = async (email: string, password: string) => {
  return apiCall('/api/auth/login', 'POST', { email, password });
};

export const register = async (email: string, password: string, name: string) => {
  return apiCall('/api/auth/register', 'POST', { email, password, name });
};

export const getConnectedAccounts = async () => {
  return apiCall('/api/user/oauth-accounts', 'GET');
};

export const getAuthUrl = async (provider: string) => {
  const baseUrl = await getBaseUrl();
  const redirectUrl = Linking.createURL('/login/success');
  return `${baseUrl}/api/auth/${provider}?state=${encodeURIComponent(redirectUrl)}`;
};
