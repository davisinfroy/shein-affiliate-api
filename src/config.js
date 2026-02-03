/**
 * Configuración centralizada de la API
 * Todas las variables de entorno se leen aquí
 */

import { getSheinCookie } from './supabase.js';

// Variable para cachear la cookie temporalmente
let cachedCookie = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // 1 minuto de cache

const config = {
  // Puerto del servidor
  port: process.env.PORT || 3000,

  // URL base de la página de conversión de afiliados (CAMBIAR AQUÍ si SHEIN modifica el path)
  sheinAffiliateUrl: 'https://m.shein.com/us/affiliate/convert-link',

  // Timeouts de Playwright (en milisegundos)
  timeouts: {
    navigation: 30000,  // Timeout para navegación
    selector: 20000,    // Timeout para esperar selectores
    action: 10000       // Timeout para acciones (click, fill, etc.)
  },

  // Función para obtener la cookie desde Supabase (con cache)
  async getCookieHeader() {
    const now = Date.now();
    
    // Usar cache si está disponible y no ha expirado
    if (cachedCookie && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedCookie;
    }

    // Obtener cookie fresca de Supabase
    cachedCookie = await getSheinCookie();
    cacheTimestamp = now;
    return cachedCookie;
  },

  // Invalidar cache (llamar después de actualizar cookie)
  invalidateCookieCache() {
    cachedCookie = null;
    cacheTimestamp = null;
  }
};

export default config;
