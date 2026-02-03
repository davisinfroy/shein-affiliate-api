import { useState } from 'react';
import { login } from '../lib/api';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.ok) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔐 Admin Login</h1>
          <p className="text-gray-400">SHEIN Affiliate API Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
