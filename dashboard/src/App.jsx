import { useState, useEffect } from 'react'
import UrlConverter from './components/UrlConverter'
import ApiDocs from './components/ApiDocs'
import Header from './components/Header'
import Login from './components/Login'
import CookieManager from './components/CookieManager'
import { isAuthenticated, getCurrentUser, logout } from './lib/api'

function App() {
  const [activeTab, setActiveTab] = useState('converter')
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getCurrentUser())
    }
    setCheckingAuth(false)
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <svg className="animate-spin h-10 w-10 text-orange-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('converter')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'converter'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🔗 Convertidor de URLs
          </button>
          <button
            onClick={() => setActiveTab('cookie')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'cookie'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🍪 Gestionar Cookie
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'docs'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📚 Documentación API
          </button>
        </div>

        {/* Content */}
        {activeTab === 'converter' && <UrlConverter />}
        {activeTab === 'cookie' && <CookieManager />}
        {activeTab === 'docs' && <ApiDocs />}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        SHEIN Affiliate API Dashboard © 2026
      </footer>
    </div>
  )
}

export default App
