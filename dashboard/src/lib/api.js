/**
 * API Client para el backend de SHEIN Affiliate
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Realizar petición autenticada
 */
async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json();
}

/**
 * Login con email y contraseña
 */
export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.ok && data.session) {
    localStorage.setItem('access_token', data.session.access_token);
    localStorage.setItem('refresh_token', data.session.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

/**
 * Logout
 */
export async function logout() {
  await authFetch('/auth/logout', { method: 'POST' });
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

/**
 * Verificar si hay sesión activa
 */
export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

/**
 * Obtener usuario actual
 */
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Obtener estado de la cookie
 */
export async function getCookieStatus() {
  return authFetch('/admin/cookie');
}

/**
 * Actualizar cookie de SHEIN
 */
export async function updateCookie(cookie) {
  return authFetch('/admin/cookie', {
    method: 'PUT',
    body: JSON.stringify({ cookie }),
  });
}

/**
 * Convertir URL a enlace de afiliado
 */
export async function convertLink(productUrl) {
  const response = await fetch(`${API_URL}/convert-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productUrl }),
  });
  return response.json();
}

export default {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  getCookieStatus,
  updateCookie,
  convertLink,
};
