/*
** EPITECH PROJECT, 2025
** Area-miror
** File description:
** api
*/

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const getBaseUrl = async () => {
  try {
    const ip = await AsyncStorage.getItem('server_ip');
    const port = await AsyncStorage.getItem('server_port');
    if (!ip || !port) return 'http://localhost:8080';
    return `http://${ip}:${port}`;
  } catch (error) {
    return 'http://localhost:8080';
  }
};

export const apiCall = async (endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: any) => {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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

export const login = async (email: string, password: string) => {
  return apiCall('/api/auth/login', 'POST', { email, password });
};

export const register = async (email: string, password: string, name: string) => {
  return apiCall('/api/auth/register', 'POST', { email, password, name });
};