import FontManager from './font-manager.js';
import EffectsEngine from './effects-engine.js';
import WidgetExporter from './widget-exporter.js';

export default class UIController {
  constructor() {
    this.app = null;
  }

  init(app) {
    this.app = app;
    this.renderEffects();
    this.renderThemes();
    this.renderFonts();
    this.syncWithState();
    this.bindEvents();
  }

  syncWithState() {
    const s = this.app.state;
    const msg = document.getElementById('message-input');
    if (msg) msg.value = s.message || '';

    const font = document.getElementById('font-select');
    if (font) font.value = s.font || 'Inter';

    const depth = document.getElementById('depth-slider');
    if (depth) depth.value = s.depth || 40;

    const textColor = document.getElementById('text-color-input');
    if (textColor) textColor.value = s.textColor || '#ffffff';

    const bgColor = document.getElementById('bg-color-input');
    if (bgColor) bgColor.value = s.bgColor || '#000000';

    document.querySelectorAll('.effect-card').forEach(c => {
      c.classList.toggle('active', c.dataset.effect === s.effect);
    });

    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.toggle('active', c.dataset.theme === s.theme);
    });
  }

  renderEffects() {
    const container = document.getElementById('effects-grid');
    if (!container) return;
    
    const effects = EffectsEngine.getEffectList();
    container.innerHTML = effects.map(eff => `
      <div class="effect-card" data-effect="${eff.id}">
        <div class="effect-preview ${eff.className}">Abc</div>
        <div class="effect-name">${eff.name}</div>
      </div>
    `).join('');
  }

  renderThemes() {
    const container = document.getElementById('theme-picker');
    if (!container) return;
    
    const themes = [
      'glassmorphic', 'neon-cyberpunk', 'minimal-clean', 'brutalist', 
      'retro-terminal', 'luxury-gold', 'soft-pastel', 'dark-monochrome'
    ];
    
    container.innerHTML = themes.map(t => `
      <div class="theme-card" data-theme="theme-${t}">
        <div class="theme-name">${t.replace(/-/g, ' ')}</div>
      </div>
    `).join('');
  }

  renderFonts(category = 'All') {
    const select = document.getElementById('font-select');
    if (!select) return;
    
    const fonts = FontManager.getFontsByCategory(category);
    select.innerHTML = fonts.map(f => `<option value="${f.name}">${f.name}</option>`).join('');
  }

  bindEvents() {
    const msgInput = document.getElementById('message-input');
    if (msgInput) msgInput.addEventListener('input', (e) => this.app.setMessage(e.target.value));

    const fontSelect = document.getElementById('font-select');
    if (fontSelect) fontSelect.addEventListener('change', (e) => this.app.setFont(e.target.value));

    const fontCatFilter = document.getElementById('font-category-filter');
    if (fontCatFilter) {
      fontCatFilter.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn) {
          fontCatFilter.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderFonts(btn.dataset.category);
          this.app.setFont(fontSelect.value);
        }
      });
    }

    const effectsGrid = document.getElementById('effects-grid');
    if (effectsGrid) {
      effectsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.effect-card');
        if (card) {
          document.querySelectorAll('.effect-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.app.setEffect(card.dataset.effect);
        }
      });
    }

    const themePicker = document.getElementById('theme-picker');
    if (themePicker) {
      themePicker.addEventListener('click', (e) => {
        const card = e.target.closest('.theme-card');
        if (card) {
          document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.app.setTheme(card.dataset.theme);
        }
      });
    }

    const depthSlider = document.getElementById('depth-slider');
    if (depthSlider) depthSlider.addEventListener('input', (e) => this.app.setDepth(e.target.value));

    const textColor = document.getElementById('text-color-input');
    if (textColor) {
      textColor.addEventListener('input', (e) => this.app.setTextColor(e.target.value));
    }

    const bgColor = document.getElementById('bg-color-input');
    if (bgColor) {
      bgColor.addEventListener('input', (e) => this.app.setBg(e.target.value));
    }

    const sizeSel = document.getElementById('widget-size');
    if (sizeSel) sizeSel.addEventListener('change', (e) => this.app.setSize(e.target.value));

    const btnEmbed = document.getElementById('btn-embed-code');
    if (btnEmbed) btnEmbed.addEventListener('click', async () => {
      const code = WidgetExporter.generateEmbedCode(this.app.getConfig());
      try {
        if (await WidgetExporter.copyToClipboard(code)) {
          this.showToast('Embed code copied!');
        } else {
          throw new Error('Clipboard failed');
        }
      } catch (e) {
        window.prompt('Copy your Embed Code below:', code);
        this.showToast('Embed code generated!');
      }
    });

    const btnDLHtml = document.getElementById('btn-download-html');
    if (btnDLHtml) btnDLHtml.addEventListener('click', () => {
      const html = WidgetExporter.generateStandaloneHTML(this.app.getConfig());
      WidgetExporter.downloadFile(html, 'widget.html');
      this.showToast('Downloaded widget.html');
    });

    const btnSnippet = document.getElementById('btn-copy-snippet');
    if (btnSnippet) btnSnippet.addEventListener('click', async () => {
      const code = WidgetExporter.generateRawSnippet(this.app.getConfig());
      try {
        if (await WidgetExporter.copyToClipboard(code)) {
          this.showToast('HTML Snippet copied!');
        } else {
          throw new Error('Clipboard failed');
        }
      } catch (e) {
        window.prompt('Copy your HTML Snippet below:', code);
        this.showToast('HTML Snippet generated!');
      }
    });

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.addEventListener('click', () => {
      this.app.resetToDefault();
      
      // Update UI active states
      document.querySelectorAll('.effect-card').forEach(c => c.classList.remove('active'));
      const defaultEff = document.querySelector('.effect-card[data-effect="effect-aurora-flow"]');
      if (defaultEff) defaultEff.classList.add('active');

      document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
      const defaultTheme = document.querySelector('.theme-card[data-theme="theme-glassmorphic"]');
      if (defaultTheme) defaultTheme.classList.add('active');

      this.showToast('System Reset Complete', 'info');
    });
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
      console.log(`Toast (${type}): ${message}`);
      return;
    }
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}
