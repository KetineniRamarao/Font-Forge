/**
 * AutoTicker Controller
 * Handles automated marquee scrolling for text that exceeds the screen width.
 */
export default class AutoTicker {
  constructor(widgetEl) {
    this.widgetEl = widgetEl;
    this.containerEl = widgetEl.querySelector('#scroll-container');
    this.textEl = widgetEl.querySelector('#widget-text');
    this.btnScroll = document.getElementById('btn-auto-scroll');
    this.promptEl = document.getElementById('scroll-prompt');
    this.btnSpeedUp = document.getElementById('btn-speed-up');
    this.btnSpeedDown = document.getElementById('btn-speed-down');
    
    this.isScrolling = false;
    this.animationFrame = null;
    this.currentX = 0;
    this.speed = 2; // pixels per frame
    
    if (this.btnScroll) {
      this.btnScroll.addEventListener('click', () => this.toggleScroll());
    }
    if (this.btnSpeedUp) {
      this.btnSpeedUp.addEventListener('click', () => { this.speed = Math.min(10, this.speed + 1); });
    }
    if (this.btnSpeedDown) {
      this.btnSpeedDown.addEventListener('click', () => { this.speed = Math.max(0.5, this.speed - 1); });
    }
    
    // Check initial state
    this.checkOverflow();
  }

  checkOverflow() {
    if (!this.containerEl || !this.textEl) return;
    
    // Reset transform to measure accurately
    this.textEl.style.transform = `translateX(0px)`;
    this.currentX = 0;
    this.isScrolling = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    
    if (this.btnScroll) {
      this.btnScroll.innerHTML = `<span class="btn-icon">▶</span><span class="btn-text">SCROLL</span>`;
    }

    // Need a tiny delay for browser to calculate new scrollWidth after font/text changes
    setTimeout(() => {
      const isOverflowing = this.textEl.scrollWidth > this.containerEl.clientWidth;
      
      if (this.btnScroll) {
        this.btnScroll.disabled = !isOverflowing;
      }
      
      if (this.promptEl) {
        if (isOverflowing) {
          this.promptEl.classList.add('visible');
        } else {
          this.promptEl.classList.remove('visible');
        }
      }
    }, 50);
  }

  toggleScroll() {
    if (this.isScrolling) {
      this.stop();
    } else {
      this.play();
    }
  }

  play() {
    this.isScrolling = true;
    if (this.promptEl) this.promptEl.classList.remove('visible');
    
    if (this.btnScroll) {
      this.btnScroll.innerHTML = `<span class="btn-icon">⏸</span><span class="btn-text">PAUSE</span>`;
    }
    
    const maxScroll = Math.max(0, this.textEl.scrollWidth - this.containerEl.clientWidth + 60);
    
    const tick = () => {
      if (!this.isScrolling) return;
      
      this.currentX -= this.speed;
      
      // If we've scrolled all the way to the end, pause briefly then reset
      if (Math.abs(this.currentX) >= maxScroll) {
        this.stop();
        setTimeout(() => this.checkOverflow(), 1000); // Reset after 1s
        return;
      }
      
      this.textEl.style.transform = `translateX(${this.currentX}px)`;
      this.animationFrame = requestAnimationFrame(tick);
    };
    
    this.animationFrame = requestAnimationFrame(tick);
  }

  stop() {
    this.isScrolling = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    
    if (this.btnScroll) {
      this.btnScroll.innerHTML = `<span class="btn-icon">▶</span><span class="btn-text">SCROLL</span>`;
    }
  }

  reset() {
    this.checkOverflow();
  }
}
