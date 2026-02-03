import { useState } from 'react'

export default function ApiDocs() {
  const [copiedCode, setCopiedCode] = useState(null)

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const curlExample = `curl -X POST http://localhost:3000/convert-link \\
  -H "Content-Type: application/json" \\
  -d '{"productUrl": "https://us.shein.com/tu-producto.html"}'`

  const jsExample = `const response = await fetch('http://localhost:3000/convert-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productUrl: 'https://us.shein.com/tu-producto.html'
  }),
});

const data = await response.json();
console.log(data.affiliateUrl);`

  const pythonExample = `import requests

response = requests.post(
    'http://localhost:3000/convert-link',
    json={'productUrl': 'https://us.shein.com/tu-producto.html'}
)

data = response.json()
print(data['affiliateUrl'])`

  const phpExample = `<?php
$ch = curl_init('http://localhost:3000/convert-link');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'productUrl' => 'https://us.shein.com/tu-producto.html'
]));

$response = curl_exec($ch);
$data = json_decode($response, true);
echo $data['affiliateUrl'];`

  const CodeBlock = ({ code, language, id }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-xs text-gray-500 uppercase">{language}</span>
        <button
          onClick={() => copyCode(code, id)}
          className={`px-2 py-1 rounded text-xs transition-all ${
            copiedCode === id
              ? 'bg-green-500 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          {copiedCode === id ? '✓' : '📋'}
        </button>
      </div>
      <pre className="bg-gray-900 rounded-lg p-4 pt-10 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">📚 Documentación de la API</h2>
        <p className="text-gray-400">
          Esta API te permite convertir URLs de productos de SHEIN en enlaces de afiliado automáticamente.
          Puedes integrarla en cualquier aplicación usando los ejemplos de código a continuación.
        </p>
      </div>

      {/* Base URL */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">🌐 URL Base</h3>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-orange-400">
          http://localhost:3000
        </div>
        <p className="text-gray-500 text-sm mt-2">
          * Cambia localhost por tu dominio o IP si despliegas la API en un servidor.
        </p>
      </div>

      {/* Endpoints */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📡 Endpoints</h3>
        
        <div className="space-y-6">
          {/* Health Check */}
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">GET</span>
              <code className="text-white font-mono">/</code>
            </div>
            <p className="text-gray-400 text-sm mb-2">Verifica que la API esté funcionando.</p>
            <div className="bg-gray-900 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Respuesta:</p>
              <code className="text-green-400 text-sm font-mono">
                {`{ "ok": true, "message": "SHEIN Affiliate API running" }`}
              </code>
            </div>
          </div>

          {/* Convert Link */}
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">POST</span>
              <code className="text-white font-mono">/convert-link</code>
            </div>
            <p className="text-gray-400 text-sm mb-3">Convierte una URL de producto en enlace de afiliado.</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-2">Request Body:</p>
                <code className="text-yellow-400 text-sm font-mono block">
{`{
  "productUrl": "https://us.shein.com/..."
}`}
                </code>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-2">Respuesta Exitosa:</p>
                <code className="text-green-400 text-sm font-mono block">
{`{
  "ok": true,
  "productUrl": "...",
  "affiliateUrl": "https://onelink.shein.com/..."
}`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">💻 Ejemplos de Código</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-2">cURL</h4>
            <CodeBlock code={curlExample} language="bash" id="curl" />
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">JavaScript / Node.js</h4>
            <CodeBlock code={jsExample} language="javascript" id="js" />
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">Python</h4>
            <CodeBlock code={pythonExample} language="python" id="python" />
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">PHP</h4>
            <CodeBlock code={phpExample} language="php" id="php" />
          </div>
        </div>
      </div>

      {/* Errors */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">⚠️ Manejo de Errores</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3">Código</th>
                <th className="pb-3">Descripción</th>
                <th className="pb-3">Respuesta</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-3"><span className="text-yellow-400">400</span></td>
                <td>URL no proporcionada</td>
                <td><code className="text-red-400 text-xs">{`{"ok": false, "error": "productUrl is required"}`}</code></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3"><span className="text-yellow-400">400</span></td>
                <td>URL inválida</td>
                <td><code className="text-red-400 text-xs">{`{"ok": false, "error": "productUrl must be a valid SHEIN URL"}`}</code></td>
              </tr>
              <tr>
                <td className="py-3"><span className="text-red-400">500</span></td>
                <td>Error interno</td>
                <td><code className="text-red-400 text-xs">{`{"ok": false, "error": "mensaje de error"}`}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🚀 Configuración Inicial</h3>
        
        <ol className="space-y-3 text-gray-300">
          <li className="flex gap-3">
            <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <div>
              <p className="font-medium">Configura tu cookie de sesión</p>
              <p className="text-sm text-gray-500">Edita el archivo <code className="text-orange-400">.env</code> con tu SHEIN_COOKIE_HEADER</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <div>
              <p className="font-medium">Inicia la API</p>
              <p className="text-sm text-gray-500">Ejecuta <code className="text-orange-400">npm start</code> en la carpeta del proyecto</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
            <div>
              <p className="font-medium">Usa la API</p>
              <p className="text-sm text-gray-500">Envía peticiones POST a <code className="text-orange-400">/convert-link</code></p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  )
}
