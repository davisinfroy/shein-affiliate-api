# SHEIN Affiliate Link API

API en Node.js para automatizar la generación de enlaces de afiliado de SHEIN usando Playwright.

## 🚀 Instalación

### Local

```bash
# Instalar dependencias
npm install

# Instalar navegadores de Playwright
npx playwright install chromium

# Crear archivo .env con tu cookie de sesión
cp .env.example .env
# Editar .env y agregar tu cookie
```

### Docker

```bash
docker build -t shein-affiliate-api .
docker run -p 3000:3000 -e SHEIN_COOKIE_HEADER="tu_cookie_aqui" shein-affiliate-api
```

## ⚙️ Configuración

Crea un archivo `.env` basado en `.env.example`:

```env
PORT=3000
SHEIN_COOKIE_HEADER=tu_cookie_completa_aqui
```

### Obtener la Cookie de Sesión

1. Ve a https://m.shein.com/us/affiliate/convert-link en tu navegador
2. Inicia sesión en tu cuenta de afiliado
3. Abre DevTools (F12) → Network
4. Recarga la página
5. Haz clic en cualquier request a shein.com
6. Copia el valor completo del header `Cookie`

## 📡 Endpoints

### GET /
Health check para verificar que la API está corriendo.

**Respuesta:**
```json
{
  "ok": true,
  "message": "SHEIN Affiliate API running"
}
```

### POST /convert-link
Convierte una URL de producto de SHEIN en un enlace de afiliado.

**Request:**
```bash
curl -X POST http://localhost:3000/convert-link \
  -H "Content-Type: application/json" \
  -d '{"productUrl": "https://us.shein.com/producto-ejemplo-p-123456.html"}'
```

**Respuesta exitosa:**
```json
{
  "ok": true,
  "productUrl": "https://us.shein.com/producto-ejemplo-p-123456.html",
  "affiliateUrl": "https://shein.top/xxxxx"
}
```

**Respuesta error:**
```json
{
  "ok": false,
  "error": "mensaje de error"
}
```

## 🔧 Ajustar Selectores

Si SHEIN cambia su interfaz, edita los selectores en `src/browser.js`:

```javascript
const SELECTORS = {
  urlInput: 'selector_del_input',
  convertButton: 'selector_del_boton',
  resultInput: 'selector_del_resultado'
};
```

## 📁 Estructura del Proyecto

```
├── package.json        # Dependencias y scripts
├── Dockerfile          # Para despliegue en Docker/EasyPanel
├── .env.example        # Plantilla de variables de entorno
├── README.md           # Documentación
└── src/
    ├── config.js       # Configuración y variables de entorno
    ├── browser.js      # Lógica de Playwright
    └── index.js        # Servidor Express
```

## ⚠️ Notas Importantes

- La cookie de sesión expira, deberás actualizarla periódicamente
- El modo headless de Playwright puede ser detectado por algunos sitios
- Los selectores pueden cambiar si SHEIN actualiza su interfaz
