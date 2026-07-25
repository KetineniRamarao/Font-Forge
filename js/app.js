import FontManager from './font-manager.js';
import EffectsEngine from './effects-engine.js';
import AutoTicker from './auto-ticker.js';
import UIController from './ui-controller.js';

class App {
  constructor() {
    this.state = {
      message: 'Hello World',
      font: 'Inter',
      effect: 'effect-aurora-flow',
      theme: 'theme-glassmorphic',
      depth: 40,
      bgColor: '',
      textColor: '',
      size: 'banner'
    };
    
    this.widgetEl = null;
    this.textEl = null;
    this.autoTicker = null;
    this.ui = new UIController();
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    if (configParam) {
      try {
        const safeConfig = configParam.replace(/ /g, '+');
        const parsed = JSON.parse(atob(safeConfig));
        this.state = { ...this.state, ...parsed };
      } catch (e) {
        console.error('Invalid config param', e);
      }
    }
    
    this.widgetEl = document.getElementById('preview-widget');
    
    if (this.widgetEl) {
      this.textEl = this.widgetEl.querySelector('.widget-3d-text');
      this.autoTicker = new AutoTicker(this.widgetEl);
    }

    await FontManager.init();
    this.ui.init(this);
    
    this.updatePreview();
    
    this.setupAutoScaling();
  }

  setupAutoScaling() {
    if (!this.widgetEl) return;
    
    const applyScale = () => {
      // 900px base width + 40px safe margin = 940
      const baseWidth = 940;
      const currentWidth = window.innerWidth;
      
      if (currentWidth < baseWidth) {
        const scale = currentWidth / baseWidth;
        // Using zoom cleanly scales document flow without leaving empty space
        this.widgetEl.style.zoom = scale;
      } else {
        this.widgetEl.style.zoom = 1;
      }
    };
    
    window.addEventListener('resize', applyScale);
    applyScale(); // Initial trigger
  }

  updatePreview() {
    if (!this.textEl) return;
    
    // Update message text
    this.textEl.textContent = this.state.message;
    
    // Apply Google Font
    FontManager.applyFont(this.state.font, this.textEl);
    
    // Apply Motion Effect
    EffectsEngine.applyEffect(this.state.effect, this.textEl);
    
    // Apply Theme (keep the base hardware-console class)
    this.widgetEl.className = `hardware-console ${this.state.theme}`;
    
    // Apply 3D Depth
    this.widgetEl.style.setProperty('--widget-depth', `${this.state.depth}px`);
    
    // Apply Text Color
    if (this.textEl) {
      this.textEl.style.color = this.state.textColor || '';
    }
    
    // Screen Background handling
    const screenBezel = this.widgetEl.querySelector('.console-screen-bezel');
    if (screenBezel) {
      screenBezel.style.backgroundColor = this.state.bgColor || '';
    }
    
    // Reset scroll offset and check length
    if (this.autoTicker) {
      this.autoTicker.reset();
    }
    // Apply Screen Background
    if (this.state.bgColor) {
      const bezel = this.widgetEl.querySelector('.console-screen-bezel');
      if (bezel) bezel.style.backgroundColor = this.state.bgColor;
    }
  }

  setMessage(text) {
    this.state.message = text || ' ';
    this.updatePreview();
  }

  setFont(fontName) {
    this.state.font = fontName;
    this.updatePreview();
  }

  setEffect(effectId) {
    this.state.effect = effectId;
    this.updatePreview();
  }

  setTheme(themeId) {
    this.state.theme = themeId;
    this.state.bgColor = '';
    this.state.textColor = '';
    this.updatePreview();
  }

  setDepth(value) {
    this.state.depth = value;
    this.updatePreview();
  }

  setBg(color) {
    this.state.bgColor = color;
    this.updatePreview();
  }

  setTextColor(color) {
    this.state.textColor = color;
    this.updatePreview();
  }

  setSize(size) {
    this.state.size = size;
    this.updatePreview();
  }

  getConfig() {
    return { ...this.state };
  }

  resetToDefault() {
    this.state = {
      message: 'Welcome to the next level.',
      font: 'Inter',
      effect: 'effect-aurora-flow',
      theme: 'theme-glassmorphic',
      depth: 40,
      bgColor: '',
      textColor: '',
      size: 'banner'
    };
    
    // Reset UI inputs if they exist
    const msgInput = document.getElementById('message-input');
    if (msgInput) msgInput.value = this.state.message;
    
    const fontSelect = document.getElementById('font-select');
    if (fontSelect) fontSelect.value = this.state.font;
    
    const textColorInput = document.getElementById('text-color-input');
    if (textColorInput) textColorInput.value = '#ffffff';
    
    const bgColorInput = document.getElementById('bg-color-input');
    if (bgColorInput) bgColorInput.value = '#0a0e27';
    
    this.updatePreview();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
