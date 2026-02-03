/**
 * Cliente de Supabase para la API
 * Maneja la conexión y operaciones con la base de datos
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Las variables SUPABASE_URL y SUPABASE_ANON_KEY son requeridas.');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Obtiene la cookie de SHEIN desde Supabase
 * @returns {Promise<string>} - Cookie de sesión de SHEIN
 */
export async function getSheinCookie() {
  const { data, error } = await supabase
    .from('shein_config')
    .select('value')
    .eq('key', 'shein_cookie')
    .single();

  if (error) {
    console.error('❌ Error obteniendo cookie de Supabase:', error.message);
    throw new Error('No se pudo obtener la cookie de SHEIN desde la base de datos');
  }

  if (!data?.value) {
    throw new Error('La cookie de SHEIN no está configurada en la base de datos');
  }

  return data.value;
}

/**
 * Actualiza la cookie de SHEIN en Supabase
 * @param {string} newCookie - Nueva cookie de sesión
 * @param {string} userId - ID del usuario que realiza el cambio
 * @returns {Promise<boolean>}
 */
export async function updateSheinCookie(newCookie, userId = null) {
  // Actualizar la cookie
  const { error: updateError } = await supabase
    .from('shein_config')
    .update({ 
      value: newCookie,
      updated_by: userId,
      updated_at: new Date().toISOString()
    })
    .eq('key', 'shein_cookie');

  if (updateError) {
    console.error('❌ Error actualizando cookie:', updateError.message);
    throw new Error('No se pudo actualizar la cookie');
  }

  // Registrar en historial
  const { error: historyError } = await supabase
    .from('cookie_history')
    .insert({
      cookie_value: newCookie.substring(0, 100) + '...', // Solo guardar parte por seguridad
      changed_by: userId
    });

  if (historyError) {
    console.warn('⚠️ No se pudo registrar en historial:', historyError.message);
  }

  return true;
}

export default supabase;
