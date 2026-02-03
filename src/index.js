/**
 * Servidor Express para la API de enlaces de afiliado de SHEIN
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import config from './config.js';
import { convertAffiliateLink } from './browser.js';
import { supabase, updateSheinCookie, getSheinCookie } from './supabase.js';

const app = express();

// Middleware para parsear JSON y CORS
app.use(express.json());
app.use(cors());

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * GET /
 * Health check - verifica que la API está corriendo
 */
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'SHEIN Affiliate API running'
  });
});

// ============================================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================================================

/**
 * Middleware para verificar token de Supabase
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(' ')[1];
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ ok: false, error: 'Token inválido o expirado' });
  }

  req.user = user;
  next();
}

// ============================================================================
// ENDPOINTS DE AUTENTICACIÓN
// ============================================================================

/**
 * POST /auth/login
 * Iniciar sesión con email y contraseña
 * 
 * Body: { "email": "...", "password": "..." }
 */
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email y contraseña son requeridos' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({ ok: false, error: error.message });
  }

  return res.json({
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at
    }
  });
});

/**
 * POST /auth/logout
 * Cerrar sesión
 */
app.post('/auth/logout', requireAuth, async (req, res) => {
  await supabase.auth.signOut();
  return res.json({ ok: true, message: 'Sesión cerrada' });
});

/**
 * GET /auth/me
 * Obtener información del usuario actual
 */
app.get('/auth/me', requireAuth, (req, res) => {
  return res.json({
    ok: true,
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

// ============================================================================
// ENDPOINTS DE ADMINISTRACIÓN DE COOKIE
// ============================================================================

/**
 * GET /admin/cookie
 * Obtener estado de la cookie actual (solo verificar si existe)
 */
app.get('/admin/cookie', requireAuth, async (req, res) => {
  try {
    const cookie = await getSheinCookie();
    return res.json({
      ok: true,
      configured: !!cookie,
      preview: cookie ? cookie.substring(0, 50) + '...' : null,
      length: cookie ? cookie.length : 0
    });
  } catch (error) {
    return res.json({
      ok: true,
      configured: false,
      preview: null,
      length: 0
    });
  }
});

/**
 * PUT /admin/cookie
 * Actualizar la cookie de SHEIN
 * 
 * Body: { "cookie": "..." }
 */
app.put('/admin/cookie', requireAuth, async (req, res) => {
  const { cookie } = req.body;

  if (!cookie) {
    return res.status(400).json({ ok: false, error: 'Cookie es requerida' });
  }

  try {
    await updateSheinCookie(cookie, req.user.id);
    config.invalidateCookieCache(); // Invalidar cache local
    
    return res.json({
      ok: true,
      message: 'Cookie actualizada correctamente'
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ============================================================================
// ENDPOINTS PRINCIPALES
// ============================================================================

/**
 * POST /convert-link
 * Convierte una URL de producto de SHEIN en un enlace de afiliado
 * 
 * Body: { "productUrl": "https://us.shein.com/..." }
 * 
 * Response éxito: { "ok": true, "productUrl": "...", "affiliateUrl": "..." }
 * Response error: { "ok": false, "error": "..." }
 */
app.post('/convert-link', async (req, res) => {
  const { productUrl } = req.body;

  // Validar que productUrl venga en el body
  if (!productUrl) {
    return res.status(400).json({
      ok: false,
      error: 'productUrl is required'
    });
  }

  // Validar que sea una URL válida de SHEIN
  if (!productUrl.includes('shein.com')) {
    return res.status(400).json({
      ok: false,
      error: 'productUrl must be a valid SHEIN URL'
    });
  }

  try {
    console.log(`\n📥 Nueva solicitud de conversión`);
    console.log(`   URL: ${productUrl}`);

    const affiliateUrl = await convertAffiliateLink(productUrl);

    console.log(`📤 Respuesta exitosa\n`);

    return res.json({
      ok: true,
      productUrl,
      affiliateUrl
    });

  } catch (error) {
    console.error(`📤 Respuesta con error: ${error.message}\n`);

    return res.status(500).json({
      ok: false,
      error: error.message || 'Error desconocido al convertir el enlace'
    });
  }
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

app.listen(config.port, () => {
  console.log('═════════════════════════════════════════════════════════');
  console.log('  🚀 SHEIN Affiliate API');
  console.log('═════════════════════════════════════════════════════════');
  console.log(`  ✅ Servidor corriendo en puerto: ${config.port}`);
  console.log(`  📄 URL de conversión: ${config.sheinAffiliateUrl}`);
  console.log(`  🍪 Cookie: Desde Supabase`);
  console.log('═════════════════════════════════════════════════════════');
  console.log('\n  Endpoints disponibles:');
  console.log('  - GET  /              → Health check');
  console.log('  - POST /convert-link  → Convertir URL a enlace de afiliado');
  console.log('  - POST /auth/login    → Iniciar sesión');
  console.log('  - POST /auth/logout   → Cerrar sesión');
  console.log('  - GET  /auth/me       → Info del usuario');
  console.log('  - GET  /admin/cookie  → Estado de cookie');
  console.log('  - PUT  /admin/cookie  → Actualizar cookie');
  console.log('\n');
});
