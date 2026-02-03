import { useState } from 'react'

export default function UrlConverter() {
  const [productUrl, setProductUrl] = useState('')
  const [affiliateUrl, setAffiliateUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleConvert = async () => {
    if (!productUrl.trim()) {
      setError('Por favor ingresa una URL de producto')
      return
    }

    if (!productUrl.includes('shein.com')) {
      setError('La URL debe ser de shein.com')
      return
    }

    setLoading(true)
    setError('')
    setAffiliateUrl('')

    try {
      const response = await fetch('/api/convert-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productUrl: productUrl.trim() }),
      })

      const data = await response.json()

      if (data.ok) {
        setAffiliateUrl(data.affiliateUrl)
      } else {
        setError(data.error || 'Error al convertir el enlace')
      }
    } catch (err) {
      setError('Error de conexión con la API')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(affiliateUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setProductUrl('')
    setAffiliateUrl('')
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🛍️</span>
          URL del Producto SHEIN
        </h2>
        
        <div className="space-y-4">
          <textarea
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="Pega aquí la URL del producto de SHEIN..."
            className="w-full h-32 bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
          
          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Convirtiendo...
                </>
              ) : (
                <>
                  🔄 Convertir a Enlace de Afiliado
                </>
              )}
            </button>
            
            <button
              onClick={handleClear}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 px-6 rounded-xl transition-all"
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Result Card */}
      {affiliateUrl && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">✅</span>
            Enlace de Afiliado Generado
          </h2>
          
          <div className="bg-gray-900/50 rounded-xl p-4 flex items-center gap-3">
            <input
              type="text"
              value={affiliateUrl}
              readOnly
              className="flex-1 bg-transparent text-green-400 font-mono text-sm focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {copied ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
          
          <div className="mt-4 flex gap-3">
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              🔗 Abrir enlace
            </a>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h3 className="font-semibold text-blue-400 mb-2">💡 Tips</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Copia la URL completa del producto desde shein.com</li>
          <li>• El enlace generado incluye tu código de afiliado automáticamente</li>
          <li>• Comparte el enlace de afiliado para ganar comisiones</li>
        </ul>
      </div>
    </div>
  )
}
