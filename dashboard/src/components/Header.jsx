export default function Header({ user, onLogout }) {
  return (
    <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-xl font-bold text-white">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SHEIN Affiliate API</h1>
            <p className="text-xs text-gray-400">Panel de Control</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">API Online</span>
          </div>
          
          {user && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
              <span className="text-sm text-gray-300">{user.email}</span>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
