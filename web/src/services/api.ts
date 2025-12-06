// web/src/services/api.ts

const BASE_URL = '/api/auth';

// --- MODIFICATION ICI ---
const getAuthHeader = () => {
  // Le backend (index-db.ts) valide la session via la base de données.
  // Il a besoin du 'sessionToken', pas du 'accessToken'.
  const token = localStorage.getItem('sessionToken');

  return token ? { Authorization: `Bearer ${token}` } : {};
};
// ------------------------

export const register = async (email: string, password: string, name: string) => {
  // ... (le reste ne change pas)
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
  // ... (le reste ne change pas)
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
  // ... (le reste ne change pas)
  try {
    const response = await fetch(`${BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(), // Utilisera maintenant le bon token
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
