// js/tts.js
// TTSManager: robust, reusable text-to-speech for all scenes

class TTSManager {
  constructor() {
    this.enabled = false;
    this.synth = window.speechSynthesis;
    this.getCurrentText = null; // Function to gather visible text in the current scene
    this.ttsButton = null;
    this._initButton();
  }

  _initButton() {
    // Try immediate initialization (in case scripts are loaded after DOM)
    const init = () => {
      this.ttsButton = document.getElementById('tts-toggle');
      if (this.ttsButton) {
        this.ttsButton.addEventListener('click', () => this.toggle());
        this._updateButton();
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
  }

  toggle() {
    this.enabled = !this.enabled;
    this._updateButton();
    if (!this.enabled) {
      this.cancel();
    } else {
      this.speakCurrentText();
    }
  }

  isEnabled() {
    return this.enabled;
  }
}

// Expose globally
window.TTSManager = new TTSManager();
