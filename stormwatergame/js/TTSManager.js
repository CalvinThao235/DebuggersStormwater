"use strict";

/**
 * Text-to-Speech Manager for the Stormwater Game
 * Provides comprehensive TTS functionality using the Web Speech API
 */

var TTSManager = {
  // TTS Configuration
  enabled: true,
  speaking: false,
  currentUtterance: null,
  speechQueue: [],
  
  // Voice settings
  settings: {
    rate: 0.9,           // Speaking rate (0.1 to 10)
    pitch: 1,            // Voice pitch (0 to 2) 
    volume: 0.8,         // Volume (0 to 1)
    voice: null,         // Selected voice (will be auto-selected)
    lang: 'en-US'        // Language
  },

  // Initialize the TTS system
  init: function() {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.warn('TTS: Speech Synthesis API not supported');
      this.enabled = false;
      return;
    }

    // Wait for voices to be loaded
    this.loadVoices();
    
    // Set up event listeners for voice changes
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }

    console.log('TTS: Manager initialized successfully');
  },

  // Load available voices and select a preferred one
  loadVoices: function() {
    const voices = speechSynthesis.getVoices();
    
    if (voices.length === 0) return;

    // Prefer English voices, prioritize female voices for educational content
    let selectedVoice = null;
    
    // Look for specific preferred voices
    const preferredVoices = [
      'Microsoft Zira - English (United States)',
      'Google US English',
      'Alex',
      'Samantha',
      'Victoria'
    ];

    for (let voiceName of preferredVoices) {
      selectedVoice = voices.find(voice => voice.name === voiceName);
      if (selectedVoice) break;
    }

    // Fallback to first English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') || voice.lang.includes('US')
      );
    }

    // Final fallback to first available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    this.settings.voice = selectedVoice;
    console.log('TTS: Voice selected:', selectedVoice ? selectedVoice.name : 'None');
  },

  // Clean text for better speech synthesis
  cleanText: function(text) {
    if (!text) return '';
    
    return text
      // Replace line breaks with pauses
      .replace(/\n/g, '. ')
      .replace(/\r/g, '')
      // Fix common game text patterns
      .replace(/HI FRIENDS!/g, 'Hi friends!')
      .replace(/I'M/g, "I'm")
      .replace(/WON'T/g, "won't")
      .replace(/CAN'T/g, "can't")
      .replace(/DON'T/g, "don't")
      .replace(/ISN'T/g, "isn't")
      .replace(/DOESN'T/g, "doesn't")
      .replace(/HAVEN'T/g, "haven't")
      .replace(/SHOULDN'T/g, "shouldn't")
      .replace(/WOULDN'T/g, "wouldn't")
      .replace(/COULDN'T/g, "couldn't")
      .replace(/HASN'T/g, "hasn't")
      .replace(/WEREN'T/g, "weren't")
      .replace(/AREN'T/g, "aren't")
      // Convert all caps to sentence case for better pronunciation
      .replace(/([A-Z]{2,})/g, function(match) {
        return match.charAt(0) + match.slice(1).toLowerCase();
      })
      // Fix specific technical terms
      .replace(/stormwater/gi, 'storm water')
      .replace(/stormdrain/gi, 'storm drain')
      .replace(/Stormdrain/gi, 'Storm drain')
      .replace(/STORMDRAIN/gi, 'Storm drain')
      // Add pauses for better pacing
      .replace(/\.\s*/g, '. ')
      .replace(/!\s*/g, '! ')
      .replace(/\?\s*/g, '? ')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      .trim();
  },

  // Speak text immediately (stops current speech)
  speak: function(text, options = {}) {
    if (!this.enabled || !text) return;

    // Clean the text
    const cleanedText = this.cleanText(text);
    if (!cleanedText) return;

    // Stop current speech
    this.stop();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Apply settings
    utterance.rate = options.rate || this.settings.rate;
    utterance.pitch = options.pitch || this.settings.pitch;
    utterance.volume = options.volume || this.settings.volume;
    utterance.voice = options.voice || this.settings.voice;
    utterance.lang = options.lang || this.settings.lang;

    // Set up event handlers
    utterance.onstart = () => {
      this.speaking = true;
      this.currentUtterance = utterance;
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.speaking = false;
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
      
      // Process next item in queue
      this.processQueue();
    };

    utterance.onerror = (event) => {
      console.warn('TTS Error:', event.error);
      this.speaking = false;
      this.currentUtterance = null;
      if (options.onError) options.onError(event);
      
      // Process next item in queue
      this.processQueue();
    };

    // Speak the utterance
    speechSynthesis.speak(utterance);

    console.log('TTS: Speaking:', cleanedText.substring(0, 50) + '...');
  },

  // Queue text to be spoken after current speech finishes
  queue: function(text, options = {}) {
    if (!this.enabled || !text) return;

    this.speechQueue.push({ text, options });
    
    // If not currently speaking, start processing queue
    if (!this.speaking) {
      this.processQueue();
    }
  },

  // Process the speech queue
  processQueue: function() {
    if (this.speaking || this.speechQueue.length === 0) return;

    const { text, options } = this.speechQueue.shift();
    this.speak(text, options);
  },

  // Stop current speech
  stop: function() {
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }
    this.speaking = false;
    this.currentUtterance = null;
  },

  // Clear the speech queue
  clearQueue: function() {
    this.speechQueue = [];
  },

  // Pause speech (if supported)
  pause: function() {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
    }
  },

  // Resume speech (if supported)
  resume: function() {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  },

  // Toggle TTS on/off
  toggle: function() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
      this.clearQueue();
    }
    console.log('TTS:', this.enabled ? 'Enabled' : 'Disabled');
    return this.enabled;
  },

  // Set TTS enabled state
  setEnabled: function(enabled) {
    this.enabled = enabled;
    if (!this.enabled) {
      this.stop();
      this.clearQueue();
    }
    console.log('TTS:', this.enabled ? 'Enabled' : 'Disabled');
  },

  // Update settings
  updateSettings: function(newSettings) {
    Object.assign(this.settings, newSettings);
  },

  // Get current status
  getStatus: function() {
    return {
      enabled: this.enabled,
      speaking: this.speaking,
      queueLength: this.speechQueue.length,
      hasVoice: !!this.settings.voice,
      supported: 'speechSynthesis' in window
    };
  },

  // Helper method to speak game text with appropriate timing
  speakGameText: function(text, options = {}) {
    const gameOptions = {
      rate: 0.8,  // Slightly slower for educational content
      ...options
    };
    
    // Add a small delay to let UI settle
    setTimeout(() => {
      this.speak(text, gameOptions);
    }, options.delay || 300);
  }
};

// TTS Button Management
var TTSButtons = {
  // Create TTS toggle button
  createToggleButton: function(scene, x, y) {
    // Store reference to scene for callbacks
    var self = this;
    
    // Create button sprite with proper callback binding
    scene.ttsButton = scene.add.button(
      x * WIDTH,
      y * HEIGHT,
      "button_sound", // Reusing existing button sprite
      function() { self.onToggleClick.call({ scene: scene }); },
      scene,
      TTSManager.enabled ? 0 : 1,
      TTSManager.enabled ? 0 : 1,
      TTSManager.enabled ? 1 : 0
    );
    scene.ttsButton.scale.setTo(0.75);
    scene.ttsButton.tint = TTSManager.enabled ? 0xFFFFFF : 0xFF6B6B;
    
    // Add TTS icon text overlay (since we're reusing audio button)
    scene.ttsButtonText = scene.add.text(
      x * WIDTH,
      y * HEIGHT - 25,
      'TTS',
      {
        font: '10pt Arial',
        fill: TTSManager.enabled ? '#000000' : '#FF6B6B',
        align: 'center'
      }
    );
    scene.ttsButtonText.anchor.setTo(0.5, 0.5);

    return scene.ttsButton;
  },

  // Handle toggle button click
  onToggleClick: function() {
    const wasEnabled = TTSManager.enabled;
    TTSManager.toggle();
    
    // Update button appearance
    if (this.scene && this.scene.ttsButton) {
      this.scene.ttsButton.setFrames(
        TTSManager.enabled ? 0 : 1,
        TTSManager.enabled ? 0 : 1,
        TTSManager.enabled ? 1 : 0
      );
      this.scene.ttsButton.tint = TTSManager.enabled ? 0xFFFFFF : 0xFF6B6B;
    }

    // Update text color
    if (this.scene && this.scene.ttsButtonText) {
      this.scene.ttsButtonText.fill = TTSManager.enabled ? '#000000' : '#FF6B6B';
    }

    // Play audio feedback
    if (this.scene && AudioManager) {
      AudioManager.playSound("bloop_sfx", this.scene);
    }

    // Announce state change
    if (TTSManager.enabled && !wasEnabled) {
      TTSManager.speak("Text to speech enabled");
    }
  },

  // Create TTS button with custom position
  createToggleButtonPos: function(scene, x, y) {
    return this.createToggleButton(scene, x, y);
  }
};

// Initialize TTS when the script loads
window.addEventListener('load', function() {
  TTSManager.init();
});

// Export for global access
window.TTSManager = TTSManager;
window.TTSButtons = TTSButtons;