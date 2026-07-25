/**
 * Widget Exporter — generates embeddable and downloadable widget output
 * Exports the fully styled Skeuomorphic hardware console
 */

class WidgetExporter {

  _collectWidgetCSS(config) {
    const needed = [
      '.hardware-console', '.console-branding', '.logo-mark', '.tagline', '.status-leds', '.led',
      '.console-screen-bezel', '.console-screen-glass', '.scanlines',
      '.widget-3d-scroll', '.widget-3d-text', '.console-control-deck', '.deck-column',
      '.hardware-group', '.hardware-label', '.hardware-input', '.hardware-select', '.select-wrapper',
      '.hardware-button-grid', '.mini-grid', '.effect-card', '.theme-card', '.effect-name', '.theme-name',
      '.btn-hardware', '.btn-export', '.btn-download', '.console-bottom-edge', '.vent-slots',
      '.brand-marquee', '.marquee-track',
      '.btn-play', '.scroll-prompt', '.char',
      `@keyframes`, config.theme, config.effect
    ];

    let css = '';
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            const text = rule.cssText || '';
            if (needed.some(sel => text.includes(sel))) {
              css += text + '\n';
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
    
    // Ensure body has the desk surface if they want the full experience in standalone, 
    // but usually standalone is embedded in an iframe so transparent is better.
    return css;
  }

  generateEmbedCode(config) {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(config))));
    let baseUrl = window.location.href.split('?')[0].replace('index.html', '');
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    return `<iframe src="${baseUrl}index.html?config=${encodeURIComponent(encoded)}" width="100%" height="100%" frameborder="0" style="border:none;overflow:hidden;" allowtransparency="true"></iframe>`;
  }

  generateStandaloneHTML(config) {
    const widgetCSS = this._collectWidgetCSS(config);
    // Grab the exact current console HTML so we don't have to duplicate the huge string
    const widgetEl = document.getElementById('preview-widget');
    const widgetHTML = widgetEl ? widgetEl.outerHTML : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FontForge Console Widget</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${config.font.replace(/ /g, '+')}:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: ${config.bgTransparent ? 'transparent' : '#1a1b26'};
    font-family: 'Inter', system-ui, sans-serif;
  }
  .char { display: inline-block; white-space: pre; }
  ${widgetCSS}
</style>
</head>
<body>
  ${widgetHTML}
<script>
(function() {
  const container = document.getElementById('scroll-container');
  const textEl = document.getElementById('widget-text');
  const btnScroll = document.getElementById('btn-auto-scroll');
  const promptEl = document.getElementById('scroll-prompt');
  
  if (!container || !textEl || !btnScroll) return;
  
  let isScrolling = false;
  let animFrame = null;
  let currentX = 0;
  
  function check() {
    textEl.style.transform = 'translateX(0px)';
    currentX = 0;
    isScrolling = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    btnScroll.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">SCROLL</span>';
    
    setTimeout(() => {
      const overflow = textEl.scrollWidth > container.clientWidth;
      btnScroll.disabled = !overflow;
      if (promptEl) {
        if (overflow) promptEl.classList.add('visible');
        else promptEl.classList.remove('visible');
      }
    }, 50);
  }
  
  btnScroll.addEventListener('click', () => {
    if (isScrolling) {
      isScrolling = false;
      if (animFrame) cancelAnimationFrame(animFrame);
      btnScroll.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">SCROLL</span>';
    } else {
      isScrolling = true;
      if (promptEl) promptEl.classList.remove('visible');
      btnScroll.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">PAUSE</span>';
      
      const maxScroll = Math.max(0, textEl.scrollWidth - container.clientWidth + 60);
      const tick = () => {
        if (!isScrolling) return;
        currentX -= 2;
        if (Math.abs(currentX) >= maxScroll) {
          isScrolling = false;
          btnScroll.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">SCROLL</span>';
          setTimeout(check, 1000);
          return;
        }
        textEl.style.transform = 'translateX(' + currentX + 'px)';
        animFrame = requestAnimationFrame(tick);
      };
      animFrame = requestAnimationFrame(tick);
    }
  });
  
  // Initial check
  window.onload = check;
})();
</script>
</body>
</html>`;
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch (e2) {
        document.body.removeChild(ta);
        return false;
      }
    }
  }

  downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default new WidgetExporter();
