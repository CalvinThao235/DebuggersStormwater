// js/tts.js
// TTSManager: robust, reusable text-to-speech for all scenes

class TTSManager {
  constructor() {
<<<<<<< Updated upstream:stormwatergame/stormwatergame/js/tts.js
    this.enabled = false;
=======
    // load saved preference if available
    try {
      const stored = localStorage.getItem('tts_enabled');
      this.enabled = stored === '1';
    } catch (e) {
      this.enabled = false;
    }

>>>>>>> Stashed changes:stormwatergame/js/tts.js
    this.synth = window.speechSynthesis;
    this.getCurrentText = null; // Function to gather visible text in the current scene
    this.ttsButton = null;
    this._initButton();
<<<<<<< Updated upstream:stormwatergame/stormwatergame/js/tts.js
  }

  _initButton() {
    // Try immediate initialization (in case scripts are loaded after DOM)
    const init = () => {
      this.ttsButton = document.getElementById('tts-toggle');
      if (this.ttsButton) {
        this.ttsButton.addEventListener('click', () => this.toggle());
        this._updateButton();
=======

    // allow other code to listen for changes
    this._eventTarget = document.createElement('div');

    // keyboard shortcut: Ctrl+M toggles TTS
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 'm') {
        // avoid interfering with form inputs
        const tag = (document.activeElement && document.activeElement.tagName) || '';
        if (['INPUT', 'TEXTAREA'].indexOf(tag) === -1) this.toggle();
      }
    });
    // notify listeners that TTSManager is ready
    setTimeout(() => this._emit('tts-ready', { enabled: this.enabled }), 0);
  }

  // Helper to find a voice by stored id/name
  _findVoice(match) {
    if (!this.synth) return null;
    const voices = this.synth.getVoices() || [];
    if (!match) return voices[0] || null;
    // match by voiceURI or name or lang
    return (
      voices.find((v) => v.voiceURI === match) ||
      voices.find((v) => v.name === match) ||
      voices.find((v) => v.lang === match) ||
      voices[0] ||
      null
    );
  }

  // Register a scene (convenience wrapper). Returns { unregister() }
  registerScene(scene, gatherFn) {
    if (!scene || typeof gatherFn !== 'function') return { unregister: function () {} };
    // set now
    this.setGatherTextFn(gatherFn);
    if (this.isEnabled()) this.speakCurrentText();
    const handler = (e) => {
      if (e && e.detail && e.detail.enabled) this.speakCurrentText();
    };
    this.on && this.on('tts-toggle', handler);
    return {
      unregister: () => {
        this.off && this.off('tts-toggle', handler);
        // if this scene had set the gather fn, clear it
        try {
          if (window && window.TTSManager && window.TTSManager.getCurrentText === gatherFn) {
            window.TTSManager.setGatherTextFn(null);
          }
        } catch (e) {}
      },
    };
  }

  on(name, fn) {
    this._eventTarget.addEventListener(name, fn);
  }

  off(name, fn) {
    this._eventTarget.removeEventListener(name, fn);
  }

  _emit(name, detail) {
    this._eventTarget.dispatchEvent(new CustomEvent(name, { detail }));
  }

  _initButton() {
    const createFallbackButton = () => {
      try {
        const btn = document.createElement('button');
        btn.id = 'tts-toggle';
        btn.setAttribute('role', 'switch');
        btn.setAttribute('aria-label', 'Toggle text to speech');
        btn.style.position = 'fixed';
        btn.style.right = '12px';
        btn.style.bottom = '12px';
        btn.style.zIndex = '2147483647';
        btn.style.pointerEvents = 'auto';
        btn.style.padding = '8px 10px';
        btn.style.borderRadius = '6px';
        btn.style.background = '#fff';
        btn.style.border = '1px solid #ccc';
        document.body.appendChild(btn);
        return btn;
      } catch (e) {
        return null;
      }
    };

    const init = () => {
      this.ttsButton = document.getElementById('tts-toggle') || createFallbackButton();
      if (this.ttsButton) {
        this.ttsButton.addEventListener('click', () => this.toggle());
        this._updateButton();
        // create indicator and settings button
        this._ensureIndicatorAndSettings();
>>>>>>> Stashed changes:stormwatergame/js/tts.js
        return true;
      }
      return false;
    };

    if (!init()) {
      window.addEventListener('DOMContentLoaded', () => init());
    }
  }

  _updateButton() {
    if (!this.ttsButton) return;
<<<<<<< Updated upstream:stormwatergame/stormwatergame/js/tts.js
    this.ttsButton.setAttribute('aria-pressed', this.enabled);
    this.ttsButton.textContent = this.enabled ? '🔊 TTS: On' : '🔊 TTS: Off';
  }

  setGatherTextFn(fn) {
    this.getCurrentText = fn;
  }

  speakCurrentText() {
    if (!this.enabled || !this.synth || typeof this.getCurrentText !== 'function') return;
    const text = this.getCurrentText();
    if (this.synth.speaking) this.synth.cancel();
    if (text && text.trim()) {
      const utter = new SpeechSynthesisUtterance(text);
      this.synth.speak(utter);
    }
  }

  cancel() {
    if (this.synth.speaking) this.synth.cancel();
=======
    try {
      this.ttsButton.setAttribute('aria-pressed', this.enabled ? 'true' : 'false');
      this.ttsButton.textContent = this.enabled ? '🔊 TTS: On' : '🔊 TTS: Off';
    } catch (e) {
      // ignore failures
    }
  }

  // ensure speaking indicator and settings UI exist
  _ensureIndicatorAndSettings() {
    try {
      // Indicator
      if (!document.getElementById('tts-indicator')) {
        const ind = document.createElement('span');
        ind.id = 'tts-indicator';
        ind.setAttribute('aria-hidden', 'true');
        ind.style.display = 'inline-block';
        ind.style.width = '10px';
        ind.style.height = '10px';
        ind.style.marginLeft = '8px';
        ind.style.borderRadius = '50%';
        ind.style.background = this.speaking ? '#0a0' : '#ccc';
        ind.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
        ind.style.transition = 'transform 0.2s, background 0.2s';
        this.ttsButton.appendChild(ind);
      }

      // Settings button
      if (!document.getElementById('tts-settings')) {
        const btn = document.createElement('button');
        btn.id = 'tts-settings';
        btn.setAttribute('aria-label', 'TTS settings');
        btn.style.position = 'fixed';
        btn.style.right = '12px';
        btn.style.bottom = '54px';
        btn.style.zIndex = '2147483647';
        btn.style.pointerEvents = 'auto';
        btn.style.padding = '6px 8px';
        btn.style.borderRadius = '6px';
        btn.style.background = '#fff';
        btn.style.border = '1px solid #ccc';
        btn.textContent = '⚙️ TTS';
        btn.addEventListener('click', () => this._toggleSettingsPanel());
        document.body.appendChild(btn);
      }

      // Panel
      if (!document.getElementById('tts-settings-panel')) {
        const panel = document.createElement('div');
        panel.id = 'tts-settings-panel';
        panel.style.position = 'fixed';
        panel.style.right = '12px';
        panel.style.bottom = '94px';
        panel.style.zIndex = '2147483647';
        panel.style.pointerEvents = 'auto';
        panel.style.padding = '12px';
        panel.style.borderRadius = '8px';
        panel.style.background = '#fff';
        panel.style.border = '1px solid #ccc';
        panel.style.display = 'none';
        panel.style.minWidth = '220px';

        panel.innerHTML = `
          <div style="font-weight:bold;margin-bottom:8px">TTS Settings</div>
          <label style="display:block;margin-bottom:6px">Voice<br><select id="tts-voice" style="width:100%"></select></label>
          <label style="display:block;margin-bottom:6px">Rate <span id="tts-rate-val">1.0</span><br><input id="tts-rate" type="range" min="0.5" max="2.0" step="0.1" value="1.0" style="width:100%"></label>
          <label style="display:block;margin-bottom:6px">Pitch <span id="tts-pitch-val">1.0</span><br><input id="tts-pitch" type="range" min="0.5" max="2.0" step="0.1" value="1.0" style="width:100%"></label>
          <div style="text-align:right;margin-top:8px"><button id="tts-test">Test</button></div>
        `;

        document.body.appendChild(panel);

        // Wire up controls
        const populate = () => {
          const select = document.getElementById('tts-voice');
          const voices = (this.synth && this.synth.getVoices && this.synth.getVoices()) || [];
          select.innerHTML = '';
          voices.forEach((v) => {
            const opt = document.createElement('option');
            opt.value = v.voiceURI || v.name;
            opt.textContent = `${v.name} (${v.lang})`;
            select.appendChild(opt);
          });
          // restore stored
          try {
            const storedVoice = localStorage.getItem('tts_voice');
            if (storedVoice) select.value = storedVoice;
          } catch (e) {}
        };

        const rate = document.getElementById('tts-rate');
        const rateVal = document.getElementById('tts-rate-val');
        const pitch = document.getElementById('tts-pitch');
        const pitchVal = document.getElementById('tts-pitch-val');
        const select = document.getElementById('tts-voice');

        // initial populate (may be empty until voicesloaded)
        populate();
        if (this.synth) {
          this.synth.onvoiceschanged = () => populate();
        }

        // restore rate/pitch
        try {
          const storedRate = localStorage.getItem('tts_rate');
          const storedPitch = localStorage.getItem('tts_pitch');
          if (storedRate) { rate.value = storedRate; rateVal.textContent = storedRate; }
          if (storedPitch) { pitch.value = storedPitch; pitchVal.textContent = storedPitch; }
        } catch (e) {}

        rate.addEventListener('input', () => { rateVal.textContent = rate.value; });
        pitch.addEventListener('input', () => { pitchVal.textContent = pitch.value; });

        document.getElementById('tts-test').addEventListener('click', () => {
          const voiceVal = select.value;
          const r = parseFloat(rate.value);
          const p = parseFloat(pitch.value);
          this.setVoice(voiceVal);
          this.setRate(r);
          this.setPitch(p);
          this.speakText('This is a test of the text to speech settings', true);
        });

        // save when panel closed or selections changed
        select.addEventListener('change', () => { try { localStorage.setItem('tts_voice', select.value); } catch (e) {} this.setVoice(select.value); });
        rate.addEventListener('change', () => { try { localStorage.setItem('tts_rate', rate.value); } catch (e) {} this.setRate(parseFloat(rate.value)); });
        pitch.addEventListener('change', () => { try { localStorage.setItem('tts_pitch', pitch.value); } catch (e) {} this.setPitch(parseFloat(pitch.value)); });
      }
    } catch (e) {
      // ignore DOM problems
    }
  }

  _toggleSettingsPanel() {
    try {
      const panel = document.getElementById('tts-settings-panel');
      if (!panel) return;
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    } catch (e) {}
  }

  setGatherTextFn(fn) {
    if (typeof fn === 'function') this.getCurrentText = fn;
  }

  // speak arbitrary text (optional force bypassing enabled flag)
  speakText(text, force = false) {
    if (!text || !text.toString) return;
    if (!force && !this.enabled) return;
    if (!this.synth) return;
    const str = text.toString().trim();
    if (!str) return;
    if (this.synth.speaking) this.synth.cancel();
    const utter = new SpeechSynthesisUtterance(str);
    // apply voice/rate/pitch
    try {
      const voice = this._findVoice(this.voice);
      if (voice) utter.voice = voice;
    } catch (e) {}
    try { if (this.rate) utter.rate = parseFloat(this.rate) || 1.0; } catch (e) {}
    try { if (this.pitch) utter.pitch = parseFloat(this.pitch) || 1.0; } catch (e) {}
    // update indicator on utter events
    utter.onstart = () => this._setSpeakingIndicator(true);
    utter.onend = () => this._setSpeakingIndicator(false);
    utter.onerror = () => this._setSpeakingIndicator(false);
    this.synth.speak(utter);
    // fallback poll
    if (!this._speakPollInterval) {
      this._speakPollInterval = setInterval(() => {
        const ind = document.getElementById('tts-indicator');
        if (ind) {
          const active = this.synth && this.synth.speaking;
          ind.style.background = active ? '#0a0' : '#ccc';
          ind.style.transform = active ? 'scale(1.25)' : 'scale(1.0)';
        }
      }, 250);
    }
  }

  _setSpeakingIndicator(on) {
    try {
      const ind = document.getElementById('tts-indicator');
      if (ind) {
        ind.style.background = on ? '#0a0' : '#ccc';
        ind.style.transform = on ? 'scale(1.25)' : 'scale(1.0)';
      }
    } catch (e) {}
  }

  setVoice(v) {
    try { this.voice = v; localStorage.setItem('tts_voice', v); } catch (e) { this.voice = v; }
  }

  setRate(r) {
    try { this.rate = r; localStorage.setItem('tts_rate', r); } catch (e) { this.rate = r; }
  }

  setPitch(p) {
    try { this.pitch = p; localStorage.setItem('tts_pitch', p); } catch (e) { this.pitch = p; }
  }

  speakCurrentText() {
    if (!this.getCurrentText || typeof this.getCurrentText !== 'function') return;
    const text = this.getCurrentText();
    // debounce slightly so rapid scene changes don't cancel the new speech
    try {
      if (this._pendingSpeakTimer) clearTimeout(this._pendingSpeakTimer);
    } catch (e) {}
    this._pendingSpeakTimer = setTimeout(() => {
      this.speakText(text, false);
      this._pendingSpeakTimer = null;
    }, 40);
  }

  cancel() {
    try {
      if (this._pendingSpeakTimer) { clearTimeout(this._pendingSpeakTimer); this._pendingSpeakTimer = null; }
    } catch (e) {}
    if (this.synth && this.synth.speaking) this.synth.cancel();
>>>>>>> Stashed changes:stormwatergame/js/tts.js
  }

  toggle() {
    this.enabled = !this.enabled;
<<<<<<< Updated upstream:stormwatergame/stormwatergame/js/tts.js
    this._updateButton();
=======
    try {
      localStorage.setItem('tts_enabled', this.enabled ? '1' : '0');
    } catch (e) {
      // ignore
    }
    this._updateButton();
    this._emit('tts-toggle', { enabled: this.enabled });
>>>>>>> Stashed changes:stormwatergame/js/tts.js
    if (!this.enabled) {
      this.cancel();
    } else {
      this.speakCurrentText();
    }
  }

  isEnabled() {
<<<<<<< Updated upstream:stormwatergame/stormwatergame/js/tts.js
    return this.enabled;
=======
    return !!this.enabled;
>>>>>>> Stashed changes:stormwatergame/js/tts.js
  }
}

// Expose globally
window.TTSManager = new TTSManager();
