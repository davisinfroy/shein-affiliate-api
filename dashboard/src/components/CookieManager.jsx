import { useState, useEffect } from 'react';
import { getCookieStatus, updateCookie } from '../lib/api';

function CookieManager() {
  const [cookieValue, setCookieValue] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadCookieStatus();
  }, []);

  const loadCookieStatus = async () => {
    setLoading(true);
    try {
      const result = await getCookieStatus();
      setStatus(result);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar estado de la cookie' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!cookieValue.trim()) {
      setMessage({ type: 'error', text: 'La cookie no puede estar vacía' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateCookie(cookieValue);
      
      if (result.ok) {
        setMessage({ type: 'success', text: '✅ Cookie actualizada correctamente' });
        setCookieValue('');
        loadCookieStatus();
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al actualizar' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-orange-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        🍪 Gestión de Cookie SHEIN
      </h2>

      {/* Estado actual */}
      <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Estado Actual</h3>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            status?.configured 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {status?.configured ? '✓ Configurada' : '✗ No configurada'}
          </span>
          {status?.configured && (
            <span className="text-gray-400 text-sm">
              {status.length} caracteres
            </span>
          )}
        </div>
        {status?.preview && (
          <p className="mt-2 text-xs text-gray-500 font-mono break-all">
            {status.preview}
          </p>
        )}
      </div>

      {/* Formulario de actualización */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Nueva Cookie de SHEIN
          </label>
          <textarea
            value={cookieValue}
            onChange={(e) => setCookieValue(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm resize-none"
            placeholder="Pega aquí el valor completo del header Cookie de tu sesión de SHEIN..."
            rows={6}
          />
          <p className="mt-2 text-xs text-gray-500">
            Obtén la cookie desde las DevTools de tu navegador (pestaña Network → Headers → Cookie) 
            cuando estés logueado en <code className="text-orange-400">m.shein.com</code>
          </p>
        </div>

        {message.text && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500 text-green-400'
              : 'bg-red-500/20 border border-red-500 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !cookieValue.trim()}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
            saving || !cookieValue.trim()
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30'
          }`}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </span>
          ) : (
            '💾 Guardar Cookie'
          )}
        </button>
      </div>

      {/* Instrucciones */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-2">📋 Cómo obtener la cookie:</h4>
        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
          <li>Abre <code className="text-orange-400">https://m.shein.com/us/affiliate/convert-link</code></li>
          <li>Inicia sesión con tu cuenta de afiliado de SHEIN</li>
          <li>Abre DevTools (F12) → pestaña Network</li>
          <li>Recarga la página y selecciona cualquier petición</li>
          <li>En Headers, busca "Cookie" y copia todo el valor</li>
          <li>Pega el valor completo aquí y guarda</li>
        </ol>
      </div>
    </div>
  );
}

export default CookieManager;
