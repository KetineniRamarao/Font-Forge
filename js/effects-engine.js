const EFFECTS = [
  { id: 'effect-aurora-flow', name: 'Aurora Flow', className: 'effect-aurora-flow', needsCharSplit: false, needsMouse: false, needsSVGFilter: false },
  { id: 'effect-digital-decay', name: 'Digital Decay', className: 'effect-digital-decay', needsCharSplit: true, needsMouse: false, needsSVGFilter: false },
  { id: 'effect-liquid-morph', name: 'Liquid Morph', className: 'effect-liquid-morph', needsCharSplit: false, needsMouse: false, needsSVGFilter: true },
  { id: 'effect-neon-pulse', name: 'Neon Pulse', className: 'effect-neon-pulse', needsCharSplit: false, needsMouse: false, needsSVGFilter: false },
  { id: 'effect-gravity-drop', name: 'Gravity Drop', className: 'effect-gravity-drop', needsCharSplit: true, needsMouse: false, needsSVGFilter: false },
  { id: 'effect-orbit-spin', name: 'Orbit Spin', className: 'effect-orbit-spin', needsCharSplit: true, needsMouse: false, needsSVGFilter: false },
  { id: 'effect-smoke-dissolve', name: 'Smoke Dissolve', className: 'effect-smoke-dissolve', needsCharSplit: true, needsMouse: false, needsSVGFilter: false },
  { id: 'effect-wave-ripple', name: 'Wave Ripple', className: 'effect-wave-ripple', needsCharSplit: true, needsMouse: false, needsSVGFilter: false },
  { id: 'effect-typewriter-stamp', name: 'Typewriter Stamp', className: 'effect-typewriter-stamp', needsCharSplit: false, needsMouse: false, needsSVGFilter: false },
  { id: 'effect-magnetic-pull', name: 'Magnetic Pull', className: 'effect-magnetic-pull', needsCharSplit: true, needsMouse: true, needsSVGFilter: false },
  { id: 'effect-crystal-shatter', name: 'Crystal Shatter', className: 'effect-crystal-shatter', needsCharSplit: true, needsMouse: false, needsSVGFilter: false },
  { id: 'effect-holographic-flip', name: 'Holographic Flip', className: 'effect-holographic-flip', needsCharSplit: true, needsMouse: false, needsSVGFilter: false },
];

class EffectsEngine {
  constructor() {
    this.originalText = '';
    this.currentEffect = null;
    this._handleMouseMoveBound = null;
  }

  getEffectList() {
    return EFFECTS;
  }

  removeEffect(textEl) {
    if (this.currentEffect) {
      textEl.classList.remove(this.currentEffect.className);
      if (this.currentEffect.needsMouse && this._handleMouseMoveBound) {
        document.removeEventListener('mousemove', this._handleMouseMoveBound);
        this._handleMouseMoveBound = null;
      }
    }
    
    const svgFilter = document.getElementById('liquid-morph-filter');
    if (svgFilter) {
      svgFilter.remove();
    }
    
    // Restore text
    if (this.originalText) {
      textEl.textContent = this.originalText;
    }
    this.currentEffect = null;
  }

  applyEffect(effectId, textEl) {
    if (!this.originalText || !textEl.querySelector('.char')) {
      this.originalText = textEl.textContent;
    } else {
      textEl.textContent = this.originalText;
    }
    
    this.removeEffect(textEl);
    
    const effect = EFFECTS.find(e => e.id === effectId);
    if (!effect) return;
    
    this.currentEffect = effect;
    
    // Set data-text for CSS pseudo-element effects like Phantom Glitch
    textEl.setAttribute('data-text', this.originalText);
    
    if (effect.needsCharSplit) {
      const chars = this.originalText.split('');
      textEl.innerHTML = '';
      chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.style.setProperty('--char-index', index);
        span.textContent = char === ' ' ? '\u00A0' : char; // Handle spaces
        textEl.appendChild(span);
      });
    }
    
    if (effect.needsSVGFilter) {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.id = 'liquid-morph-filter';
      svg.style.position = 'absolute';
      svg.style.width = '0';
      svg.style.height = '0';
      svg.innerHTML = `
        <filter id="liquid">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" seed="2">
            <animate attributeName="baseFrequency" dur="4s" values="0.015;0.03;0.015" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      `;
      document.body.appendChild(svg);
    }
    
    // Set data-text for pseudo-element effects (e.g., Phantom Glitch)
    textEl.setAttribute('data-text', this.originalText);
    
    if (effect.needsMouse) {
      this._handleMouseMoveBound = (e) => this.handleMouseMove(e, textEl);
      document.addEventListener('mousemove', this._handleMouseMoveBound);
    }
    
    textEl.classList.add(effect.className);
  }

  handleMouseMove(e, textEl) {
    if (!this.currentEffect || !this.currentEffect.needsMouse) return;
    
    const chars = textEl.querySelectorAll('.char');
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    chars.forEach(char => {
      const rect = char.getBoundingClientRect();
      const charX = rect.left + rect.width / 2;
      const charY = rect.top + rect.height / 2;
      
      const dx = mouseX - charX;
      const dy = mouseY - charY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const maxDist = 200;
      if (dist < maxDist) {
        const pull = (maxDist - dist) / maxDist;
        char.style.setProperty('--pull-x', `${(dx * pull * 0.2)}px`);
        char.style.setProperty('--pull-y', `${(dy * pull * 0.2)}px`);
      } else {
        char.style.setProperty('--pull-x', '0px');
        char.style.setProperty('--pull-y', '0px');
      }
    });
  }
}

export default new EffectsEngine();
