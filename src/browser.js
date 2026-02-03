/**
 * Módulo de automatización con Playwright
 * Maneja la interacción con la página de conversión de enlaces de afiliado de SHEIN
 */

import { chromium } from 'playwright';
import config from './config.js';

// ============================================================================
// SELECTORES - CAMBIAR AQUÍ si la UI de SHEIN cambia
// ============================================================================
const SELECTORS = {
  // Textarea donde se pega la URL del producto (clase real de SHEIN)
  urlInput: 'textarea[class*="convert-link_textarea"], textarea[placeholder*="SHEIN product link"], textarea',
  
  // Botón Confirm para generar el enlace
  convertButton: 'button[class*="convert-link_confirmButton"], button:has-text("Confirm")',
  
  // Selector para detectar cuando el botón está habilitado (sin clase disabled)
  convertButtonEnabled: 'button[class*="convert-link_confirmButton"]:not([class*="disabled"])',
  
  // Área de resultado después de la conversión
  resultArea: '[class*="result"], [class*="converted"], [class*="affiliate"]'
};

/**
 * Convierte una URL de producto de SHEIN en un enlace de afiliado
 * @param {string} productUrl - URL del producto de SHEIN
 * @returns {Promise<string>} - Enlace de afiliado generado
 */
export async function convertAffiliateLink(productUrl) {
  let browser = null;

  try {
    console.log(`🚀 Iniciando conversión para: ${productUrl}`);

    // Lanzar navegador en modo headless
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Crear contexto con user agent móvil
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      viewport: { width: 390, height: 844 }
    });

    // Parsear y añadir cookies al contexto (obtenidas de Supabase)
    const cookieString = await config.getCookieHeader();
    const cookies = cookieString.split(';').map(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      return {
        name: name.trim(),
        value: valueParts.join('='),
        domain: '.shein.com',
        path: '/'
      };
    }).filter(c => c.name && c.value);
    
    await context.addCookies(cookies);
    console.log(`🍪 ${cookies.length} cookies añadidas al contexto`);

    const page = await context.newPage();

    // Configurar timeouts
    page.setDefaultTimeout(config.timeouts.selector);
    page.setDefaultNavigationTimeout(config.timeouts.navigation);

    console.log(`📄 Navegando a: ${config.sheinAffiliateUrl}`);

    // Navegar a la página de conversión
    await page.goto(config.sheinAffiliateUrl, {
      waitUntil: 'networkidle'
    });

    console.log('✅ Página cargada, buscando formulario...');

    // Debug: tomar screenshot y guardar HTML
    await page.screenshot({ path: '/tmp/shein-loaded.png', fullPage: true });
    const html = await page.content();
    console.log('📸 Screenshot guardado en /tmp/shein-loaded.png');
    
    // Imprimir todos los botones e inputs para debug
    const buttons = await page.$$eval('button', els => els.map(e => ({ text: e.textContent?.trim(), class: e.className })));
    const inputs = await page.$$eval('input, textarea', els => els.map(e => ({ type: e.type, placeholder: e.placeholder, class: e.className })));
    console.log('🔍 Botones encontrados:', JSON.stringify(buttons, null, 2));
    console.log('🔍 Inputs encontrados:', JSON.stringify(inputs, null, 2));

    // Esperar a que el input de URL esté disponible
    const urlInput = await page.waitForSelector(SELECTORS.urlInput, {
      timeout: config.timeouts.selector,
      state: 'visible'
    });

    if (!urlInput) {
      throw new Error('No se encontró el campo de entrada para la URL del producto');
    }

    console.log('📝 Pegando URL del producto...');

    // Limpiar el campo y pegar la URL del producto
    await urlInput.click();
    await urlInput.fill('');
    await urlInput.fill(productUrl);

    // Esperar a que el botón se habilite después de pegar la URL
    console.log('⏳ Esperando que el botón se habilite...');
    await page.waitForTimeout(1000);

    // Buscar el botón de conversión
    const convertButton = await page.waitForSelector(SELECTORS.convertButton, {
      timeout: config.timeouts.selector,
      state: 'visible'
    });

    if (!convertButton) {
      throw new Error('No se encontró el botón de conversión');
    }

    // Verificar si el botón está habilitado
    const buttonClass = await convertButton.getAttribute('class');
    console.log('🎯 Clase del botón:', buttonClass);

    console.log('🗑️ Haciendo clic en Confirm...');
    await convertButton.click();

    // Esperar a que aparezca el modal "Product link converted"
    console.log('⏳ Esperando modal de resultado...');
    
    // Esperar el modal con el botón "Copy Link"
    const copyLinkButton = await page.waitForSelector('button:has-text("Copy Link"), button:has-text("Copy"), [class*="copy"]', {
      timeout: 10000,
      state: 'visible'
    });

    if (!copyLinkButton) {
      await page.screenshot({ path: '/tmp/shein-no-modal.png', fullPage: true });
      throw new Error('No apareció el modal con el botón Copy Link');
    }

    console.log('✅ Modal detectado, extrayendo enlace...');

    // Interceptar las peticiones de red para capturar la URL de afiliado
    // También intentar obtener el link del atributo data o del clipboard
    
    let affiliateUrl = null;

    // Método 1: Buscar el enlace en atributos data del botón o elementos cercanos
    const modalContent = await page.$('[class*="modal"], [class*="popup"], [class*="dialog"], [class*="converted"]');
    if (modalContent) {
      // Buscar cualquier elemento que contenga la URL de afiliado
      const allElements = await modalContent.$$('*');
      for (const el of allElements) {
        const dataUrl = await el.getAttribute('data-url');
        const dataLink = await el.getAttribute('data-link');
        const href = await el.getAttribute('href');
        
        if (dataUrl && dataUrl.includes('http')) {
          affiliateUrl = dataUrl;
          break;
        }
        if (dataLink && dataLink.includes('http')) {
          affiliateUrl = dataLink;
          break;
        }
        if (href && href.includes('shein') && href !== productUrl) {
          affiliateUrl = href;
          break;
        }
      }
    }

    // Método 2: Escuchar el clipboard después de hacer clic en Copy Link
    if (!affiliateUrl) {
      // Dar permisos de clipboard y hacer clic en Copy Link
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      
      console.log('🖱️ Haciendo clic en Copy Link...');
      await copyLinkButton.click();
      await page.waitForTimeout(1000);

      // Leer del clipboard
      try {
        affiliateUrl = await page.evaluate(async () => {
          return await navigator.clipboard.readText();
        });
        console.log(`📋 Clipboard: ${affiliateUrl}`);
      } catch (e) {
        console.log('⚠️ No se pudo leer el clipboard:', e.message);
      }
    }

    // Método 3: Buscar en el HTML por patrones de URL de afiliado
    if (!affiliateUrl) {
      const pageContent = await page.content();
      const affiliatePatterns = [
        /https?:\/\/[^\s"'<>]*shein\.top[^\s"'<>]*/g,
        /https?:\/\/[^\s"'<>]*api-shein[^\s"'<>]*/g,
        /https?:\/\/[^\s"'<>]*activitylink[^\s"'<>]*/g,
        /https?:\/\/[^\s"'<>]*share[^\s"'<>]*shein[^\s"'<>]*/g,
        /https?:\/\/[^\s"'<>]*referurl[^\s"'<>]*/g
      ];
      
      for (const pattern of affiliatePatterns) {
        const matches = pageContent.match(pattern);
        if (matches && matches.length > 0) {
          affiliateUrl = matches[0];
          console.log(`🔗 Encontrado por patrón: ${affiliateUrl}`);
          break;
        }
      }
    }

    // Método 4: Interceptar respuestas de red que contengan el link
    if (!affiliateUrl) {
      // Tomar screenshot para debug
      await page.screenshot({ path: '/tmp/shein-after-click.png', fullPage: true });
      console.log('📸 Screenshot guardado en /tmp/shein-after-click.png');
      
      // Buscar en los scripts de la página
      const scripts = await page.$$eval('script', els => els.map(e => e.textContent).join('\n'));
      const urlMatch = scripts.match(/"(https?:\/\/[^"]*(?:shein\.top|activitylink|share)[^"]*)"/)
      if (urlMatch) {
        affiliateUrl = urlMatch[1];
        console.log(`📜 Encontrado en script: ${affiliateUrl}`);
      }
    }

    if (!affiliateUrl) {
      throw new Error('No se pudo extraer el enlace de afiliado del modal. Revisa /tmp/shein-after-click.png');
    }

    // Limpiar el resultado
    affiliateUrl = affiliateUrl.trim();

    console.log(`✅ Enlace de afiliado obtenido: ${affiliateUrl}`);

    return affiliateUrl;

  } catch (error) {
    console.error(`❌ Error en conversión: ${error.message}`);
    throw error;

  } finally {
    // Cerrar el navegador siempre
    if (browser) {
      console.log('🧹 Cerrando navegador...');
      await browser.close();
    }
  }
}
