import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

/**
 * `ocean-eye-bubble`
 * Container of an information item for Startup Radiator dashboard
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class OceanEyeBubble extends PolymerElement {
  static get template() {
    return html`
    <style>
      * {
        box-sizing: border-box;
      }
      :host {
        position: relative;
        display: inline-block;
        overflow: hidden;
        transition: all var(--animation-timing, 300ms) ease-in-out var(--animation-timing, 300ms);
        opacity: 0;
        width: 0;
        height: 0;
      }
      :host([visible]) {
        transition: all var(--animation-timing, 300ms) ease-in-out;
        opacity: 1;
        width: var(--bubble-size, 300px);
        height: var(--bubble-size, 300px);
      }
      :host([visible]) .wrapper {
        transition: all var(--animation-timing, 300ms) ease-in-out var(--animation-timing, 300ms);
        width: var(--bubble-aspect, 80%);
        height: var(--bubble-aspect, 80%);
      }
      :host([visible]) .background > canvas,
      :host([spread]) .content {
        opacity: 1;
      }
      .wrapper,
      .background {
        position: absolute;
      }
      .wrapper {
        z-index: 2;
        width: 0%;
        height: 0%;
        top: 50%;
        left: 50%;
        transition: all var(--animation-timing, 300ms) ease-in-out;
        transform: translateX(-50%) translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .content {
        opacity: 0;
        transition: all var(--animation-timing, 300ms) ease-in-out;
      }
      .background {
        z-index: 1;
        width: 100%;
        height: 100%;
      }
      .background > canvas {
        opacity: 0;
        width: 100%;
        height: 100%;
        transition: opacity 300ms;
      }
    </style>
    <div class="wrapper">
      <div class="content">
        <slot></slot>
      </div>
    </div>
    <div class="background">
      <canvas></canvas>
    </div>
    `;
  }
  static get properties() {
    return {
      /**
       * Element visibility
       *
       * No need for observers, since it's evaluated through css
       */
      visible: {
        type: Boolean,
        reflectToAttribute: true,
        value: true
      },
      /**
       * Spread
       *
       * No need for observers, since it's evaluated at each frame
       */
      spread: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      },
      /**
       * Time to spread
       *
       * No need for observers, since it's evaluated at each frame
       */
      timeToSpread: {
        type: Number,
        reflectToAttribute: true,
        value: 60
      },
      /**
       * Element bubbles number counter
       *
       * Observer applies rebubble() to the element
       */
      counter: {
        type: Number,
        reflectToAttribute: true,
        value: 8,
        observer: 'rebubble'
      },
      /**
       * Bubbles color
       *
       * No need for observers, since it's evaluated at each frame
       */
      color: {
        type: String,
        reflectToAttribute: true,
        value: '#07a'
      },
      /**
       * Bubbles array, filled after element ready
       * with and object for each bubble
       */
      bubbles: {
        type: Array,
        reflectToAttribute: true,
        value: () => []
      },
      /**
       * Got it from @emoji-rain, thanks
       */
      _boundAnimate: {
        type: Function,
        value: function() { return this._animate.bind(this) }
      },
    }
  }
  /**
   * Fill canvas with bubble theme
   */
  ready() {
    super.ready()
    // load bubbles and start animation
    this._load()
  }
  /**
   * Load bubbles define canavas and start animation
   *
   */
  _load() {
    // prepare canvas
    this.w = this.offsetWidth
    this.h = this.offsetHeight
    this.canvas = this.root.querySelector('canvas')
    this.canvas.width = this.w
    this.canvas.height = this.h
    this.context = this.canvas.getContext('2d')
    this.canvasPadding = 10
    this.lineWidth = 3
    this.context.lineWidth = this.lineWidth
    // fill bubbles array
    let d, t, x, y, r, s, l1, l2, v, vr, pad = 0, dMax = 0, ox, oy,
        p = this.canvasPadding + this.lineWidth,
        rotateDirs = ['foreword','backward'], ls = false
    for (let i = 0; i < this.counter; i++) {
      d = Math.floor(Math.random()*35+25) // initial diameter
      dMax = d > dMax ? d : dMax
      t = (d + p)*1.1
      x = Math.floor(Math.random()*(this.w-t-p)+t) - d/2
      y = Math.floor(Math.random()*(this.h-t-p)+t) - d/2
      ox = x // save original x
      oy = y // save original y
      r = Math.floor(Math.random()*220+1) // initial rotation
      s = d/10 // max scale expansion
      l2 = (d-s) <= 0 ? 0 : (d-s)// limit min diameter
      l1 = d+s // limit max diameter
      v = 'out' // out || in - expansion versus
      vr = rotateDirs[Math.round(Math.random())] // rotate versus
      this.bubbles.push({x, y, d, r, v, vr, l1, l2, ls, ox, oy})
    }
    // define corners coords
    pad = Math.floor(dMax/2 + p)
    this._corners = [
      { x: pad, y: pad },
      { x: this.canvas.width - pad, y: pad },
      { x: this.canvas.width - pad, y: this.canvas.height - pad },
      { x: pad, y: this.canvas.height - pad },
      { x: pad, y: this.canvas.height/2 },
      { x: this.canvas.width/2, y: pad },
      { x: this.canvas.width - pad, y: this.canvas.height/2 },
      { x: this.canvas.width/2, y: this.canvas.height - pad },
    ]
    // set loaded
    this.isLoaded = true
    // trigger canvas animation
    this._animate()
  }
  /**
   * Animate canvas
   *
   * @return void
   */
  _animate() {
    this.timeout = setTimeout(() => {
      this.animationFrame = window.requestAnimationFrame(this._boundAnimate)
      this._moveBubbles()
    }, this.timeToSpread/60)
  }
  /**
   * Move bubbles on canvas
   *
   */
  _moveBubbles() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fillStyle = this.color
    this.context.strokeStyle = this.color
    let x, y, s, r, p = 0.1, corner
    /**
     * @param Int single coord of bubble
     * @param Int single coord of corner targeted
     */
    let pos = (from, to) => {
      if (from !== to) {
        return (from > to) ? from - ((from - to) / this.timeToSpread)
                           : from + ((to - from) / this.timeToSpread)
      }
      return from
    }
    for (let i = 0; i < this.bubbles.length; i++) {
      // redefine bubble diameter (scaling)
      if (this.bubbles[i].v === 'out') {
        if (this.bubbles[i].d < this.bubbles[i].l1) this.bubbles[i].d += p
        else this.bubbles[i].v = 'in'
      } else if (this.bubbles[i].v === 'in') {
        if (this.bubbles[i].d > this.bubbles[i].l2) this.bubbles[i].d -= p
        else this.bubbles[i].v = 'out'
      }
      // bubble radius
      r = this.bubbles[i].d/2
      // reposition bubble center according to spread
      corner = this._corners[i % this._corners.length]
      if (this.spread) {
        this.bubbles[i].x = pos(this.bubbles[i].x, corner.x)
        this.bubbles[i].y = pos(this.bubbles[i].y, corner.y)
      } else {
        this.bubbles[i].x = pos(this.bubbles[i].x, this.bubbles[i].ox)
        this.bubbles[i].y = pos(this.bubbles[i].y, this.bubbles[i].oy)
      }
      // save context
      this.context.save()
      // move to bubble center
      this.context.translate(this.bubbles[i].x,this.bubbles[i].y)
      // rotate
      this.context.rotate(this.bubbles[i].r*Math.PI/180)
      if (this.bubbles[i].vr === 'foreword') {
        if (this.bubbles[i].r <= 360) this.bubbles[i].r++
        else this.bubbles[i].r = 0
      } else if (this.bubbles[i].vr === 'backward') {
        if (this.bubbles[i].r > 0) this.bubbles[i].r--
        else this.bubbles[i].r = 360
      }
      // draw bubble circle
      this.context.beginPath()
      this.context.arc(0,0,r,0,2*Math.PI)
      this.context.stroke()
      // inside first line
      this.context.beginPath()
      this.context.lineWidth = this.lineWidth/2
      this.context.arc(0,0,r-this.lineWidth,0,0.8*Math.PI)
      this.context.stroke()
      this.context.rotate(25*Math.PI/180)
      // inside second line
      this.context.beginPath()
      this.context.lineWidth = this.lineWidth/4
      this.context.arc(0,0,r-(this.lineWidth*2),0,0.5*Math.PI)
      this.context.stroke()
      // restore context settings
      this.context.restore()
    }
  }
  /**
   * Redefine bubbles, canvas and restart
   */
  rebubble() {
    // prevent running before _load()
    if (this.isLoaded) {
      // fade out canvas
      this.canvas.setAttribute('style','opacity:0')
      setTimeout(() => {
        // stop animation
        clearTimeout(this.timeout)
        window.cancelAnimationFrame(this.animationFrame)
        // reset bubbles
        this.bubbles = []
        // restart
        this._load()
        // fade in canvas
        setTimeout(() => { this.canvas.removeAttribute('style') }, 300)
      }, 300)
    }
  }
  /**
   * Toggle visibility
   */
  toggle() { this.visible = !this.visible }
  /**
   * Show
   */
  show() { this.visible = true }
  /**
   * Hide
   */
  hide() { this.visible = false }
  /**
   * Toggle bubbles spread
   */
  togglePosition() { this.spread = !this.spread }
  /**
   * Send bubbles to corners
   */
  toCorners() { this.spread = true }
  /**
   * Send bubbles back to origins
   */
  backIn() { this.spread = false }
}

window.customElements.define('ocean-eye-bubble', OceanEyeBubble);
