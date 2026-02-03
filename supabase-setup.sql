-- ============================================================================
-- SCRIPT SQL PARA SUPABASE - SHEIN AFFILIATE API
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- 1. Crear tabla para almacenar la cookie de SHEIN
CREATE TABLE IF NOT EXISTS shein_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2. Insertar registro inicial para la cookie (vacío por defecto)
INSERT INTO shein_config (key, value, description)
VALUES ('shein_cookie', '', 'Cookie de sesión de SHEIN para el conversor de enlaces de afiliado')
ON CONFLICT (key) DO NOTHING;

-- 3. Crear función para actualizar el timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_shein_config_updated_at ON shein_config;
CREATE TRIGGER update_shein_config_updated_at
  BEFORE UPDATE ON shein_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Crear tabla para registrar el historial de cambios de cookie
CREATE TABLE IF NOT EXISTS cookie_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cookie_value TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ============================================================================

-- Habilitar RLS en las tablas
ALTER TABLE shein_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_history ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera autenticado puede LEER la configuración
CREATE POLICY "Authenticated users can read config"
  ON shein_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Solo usuarios autenticados pueden ACTUALIZAR la configuración
CREATE POLICY "Authenticated users can update config"
  ON shein_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: Usuarios autenticados pueden insertar en historial
CREATE POLICY "Authenticated users can insert history"
  ON cookie_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Usuarios autenticados pueden leer historial
CREATE POLICY "Authenticated users can read history"
  ON cookie_history
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- POLÍTICA PÚBLICA PARA EL BACKEND (API Key / Service Role)
-- ============================================================================

CREATE POLICY "Public can read shein_cookie for API"
  ON shein_config
  FOR SELECT
  TO anon
  USING (key = 'shein_cookie');
