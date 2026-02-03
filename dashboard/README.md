# SHEIN Affiliate Dashboard

Panel de administración para la API de SHEIN Affiliate.

## Instalación

```bash
cd dashboard
npm install
npm run dev
```

## Configuración

Crea un archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Características

- Conversor de URLs de productos a enlaces de afiliado
- Gestión de cookie de sesión SHEIN
- Documentación de la API
- Login con Supabase Auth
