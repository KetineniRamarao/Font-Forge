const FONT_LIST = [
  { name: 'Playfair Display', category: 'Serif' },
  { name: 'Merriweather', category: 'Serif' },
  { name: 'Lora', category: 'Serif' },
  { name: 'Cormorant Garamond', category: 'Serif' },
  { name: 'Inter', category: 'Sans-Serif' },
  { name: 'Poppins', category: 'Sans-Serif' },
  { name: 'Space Grotesk', category: 'Sans-Serif' },
  { name: 'Outfit', category: 'Sans-Serif' },
  { name: 'Righteous', category: 'Display' },
  { name: 'Bebas Neue', category: 'Display' },
  { name: 'Bungee', category: 'Display' },
  { name: 'Press Start 2P', category: 'Display' },
  { name: 'Dancing Script', category: 'Handwriting' },
  { name: 'Pacifico', category: 'Handwriting' },
  { name: 'Caveat', category: 'Handwriting' },
  { name: 'JetBrains Mono', category: 'Monospace' },
  { name: 'Fira Code', category: 'Monospace' },
  { name: 'Source Code Pro', category: 'Monospace' }
];

class FontManager {
  constructor() {
    this.loadedFonts = new Set();
  }

  getFontsByCategory(category) {
    if (!category || category.toLowerCase() === 'all') return FONT_LIST;
    const normalized = category.toLowerCase().replace(/\s+/g, '-');
    return FONT_LIST.filter(font => font.category.toLowerCase().replace(/\s+/g, '-') === normalized);
  }

  loadFont(fontName) {
    return new Promise((resolve) => {
      if (this.loadedFonts.has(fontName)) {
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      link.onload = () => {
        this.loadedFonts.add(fontName);
        resolve();
      };
      link.onerror = () => {
        console.error(`Failed to load font: ${fontName}`);
        resolve(); // resolve anyway to not block
      };
      document.head.appendChild(link);
    });
  }

  async applyFont(fontName, targetEl) {
    await this.loadFont(fontName);
    targetEl.style.fontFamily = `"${fontName}", sans-serif`;
  }

  async init() {
    if (FONT_LIST.length > 0) {
      await this.loadFont('Inter');
    }
  }
}

export default new FontManager();
