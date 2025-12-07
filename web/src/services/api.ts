const BASE_URL = '/api/auth';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('sessionToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const register = async (email: string, password: string, name: string) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur inconnue' };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Erreur serveur' };
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur inconnue' };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Erreur serveur' };
  }
};

export const me = async () => {
  try {
    const response = await fetch(`${BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) logout();
      return { success: false, error: data.error };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Erreur serveur' };
  }
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('sessionToken');
  window.location.href = '/login';
};

export interface Action {
  name: string;
  description: string;
}

export interface Reaction {
  name: string;
  description: string;
}

export interface Service {
  name: string;
  actions: Action[];
  reactions: Reaction[];
}

export const getServices = async () => {
  try {
    const response = await fetch('http://localhost:3000/about.json');
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    return data.server?.services || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};
