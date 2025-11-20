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



// ADA Menu System
var ADAMenu = {
  isOpen: false,
  colorBlindMode: 0, // 0 = Off, 1 = Deuteranopia, 2 = Protanopia, 3 = Tritanopia
  colorBlindTypes: ['Off', 'Deuteranopia', 'Protanopia', 'Tritanopia'],
  highContrastMode: false,
  
  // Create ADA menu button in bottom left
  createADAButton: function(scene) {
    // Create a simple circular background for the wheelchair icon
    scene.adaButton = scene.add.graphics(0, 0);
    scene.adaButton.beginFill(0x28A745, 0.9);
    scene.adaButton.drawCircle(0.03 * WIDTH, 0.89 * HEIGHT, 20);
    scene.adaButton.endFill();
    scene.adaButton.inputEnabled = true;
    scene.adaButton.input.useHandCursor = true;
    scene.adaButton.events.onInputDown.add(function() {
      ADAMenu.toggleMenu.call(scene);
    }, scene);
    
    // Add accessibility icon (♿)
    scene.adaButtonIcon = scene.add.text(
      0.03 * WIDTH,
      0.89 * HEIGHT,
      '♿',
      {
        font: 'bold 16pt Arial',
        fill: '#FFFFFF',
        align: 'center'
      }
    );
    scene.adaButtonIcon.anchor.setTo(0.5, 0.5);

    // Add "ADA Menu" label below button
    scene.adaButtonText = scene.add.text(
      0.03 * WIDTH,
      0.89 * HEIGHT + 30,
      'ADA Menu',
      {
        font: 'bold 8pt Arial',
        fill: '#28A745',
        align: 'center'
      }
    );
    scene.adaButtonText.anchor.setTo(0.5, 0);

    // Create the hidden menu
    this.createADAMenu(scene);
    
    // Add keyboard support - T key for TTS, backslash for menu
    scene.ttsKey = scene.input.keyboard.addKey(Phaser.Keyboard.T);
    scene.ttsKey.onDown.add(function() {
      ADAMenu.toggleTTS(scene);
    }, scene);

    // Add backslash key for menu toggle
    scene.adaMenuKey = scene.input.keyboard.addKey(Phaser.Keyboard.BACKSLASH);
    scene.adaMenuKey.onDown.add(function() {
      ADAMenu.toggleMenu.call(scene);
    }, scene);

    return scene.adaButton;
  },

  // Create the ADA options menu
  createADAMenu: function(scene) {
    // Menu background - cleaner, more compact
    scene.adaMenuBG = scene.add.graphics(0, 0);
    scene.adaMenuBG.beginFill(0x000000, 0.9);
    scene.adaMenuBG.drawRoundedRect(
      0.02 * WIDTH, 0.55 * HEIGHT,
      0.28 * WIDTH, 0.28 * HEIGHT,
      8
    );
    scene.adaMenuBG.visible = false;

    // Menu border
    scene.adaMenuBorder = scene.add.graphics(0, 0);
    scene.adaMenuBorder.lineStyle(2, 0x28A745, 1);
    scene.adaMenuBorder.drawRoundedRect(
      0.02 * WIDTH, 0.55 * HEIGHT,
      0.28 * WIDTH, 0.28 * HEIGHT,
      8
    );
    scene.adaMenuBorder.visible = false;

    // Menu title
    scene.adaMenuTitle = scene.add.text(
      0.16 * WIDTH,
      0.57 * HEIGHT,
      'Accessibility',
      {
        font: 'bold 11pt Arial',
        fill: '#FFFFFF',
        align: 'center'
      }
    );
    scene.adaMenuTitle.anchor.setTo(0.5, 0);
    scene.adaMenuTitle.visible = false;

    // === TTS SECTION ===
    // TTS Toggle Box (simple rectangle)
    scene.ttsToggleButton = scene.add.graphics(0, 0);
    scene.ttsToggleButton.beginFill(TTSManager.enabled ? 0xFF4444 : 0x000000, 0.8);
    scene.ttsToggleButton.drawRoundedRect(0.04 * WIDTH, 0.61 * HEIGHT, 15, 15, 3);
    scene.ttsToggleButton.endFill();
    scene.ttsToggleButton.inputEnabled = true;
    scene.ttsToggleButton.input.useHandCursor = true;
    scene.ttsToggleButton.events.onInputDown.add(function() {
      ADAMenu.toggleTTS(scene);
    }, scene);
    scene.ttsToggleButton.visible = false;

    // TTS Label
    scene.ttsLabel = scene.add.text(
      0.065 * WIDTH,
      0.618 * HEIGHT,
      'Text-to-Speech (T)',
      {
        font: '8pt Arial',
        fill: '#FFFFFF',
        align: 'left'
      }
    );
    scene.ttsLabel.anchor.setTo(0, 0.5);
    scene.ttsLabel.visible = false;

    // TTS Status
    scene.ttsStatus = scene.add.text(
      0.27 * WIDTH,
      0.618 * HEIGHT,
      TTSManager.enabled ? 'ON' : 'OFF',
      {
        font: 'bold 8pt Arial',
        fill: TTSManager.enabled ? '#FF4444' : '#666666',
        align: 'right'
      }
    );
    scene.ttsStatus.anchor.setTo(1, 0.5);
    scene.ttsStatus.visible = false;

    // === COLORBLIND SECTION ===
    // Colorblind Toggle Box (simple rectangle)
    scene.colorBlindButton = scene.add.graphics(0, 0);
    scene.colorBlindButton.beginFill(this.colorBlindMode > 0 ? 0xFF4444 : 0x000000, 0.8);
    scene.colorBlindButton.drawRoundedRect(0.04 * WIDTH, 0.67 * HEIGHT, 15, 15, 3);
    scene.colorBlindButton.endFill();
    scene.colorBlindButton.inputEnabled = true;
    scene.colorBlindButton.input.useHandCursor = true;
    scene.colorBlindButton.events.onInputDown.add(function() {
      ADAMenu.toggleColorBlind(scene);
    }, scene);
    scene.colorBlindButton.visible = false;

    // Colorblind Label
    scene.colorBlindLabel = scene.add.text(
      0.065 * WIDTH,
      0.678 * HEIGHT,
      'Colorblind Mode (C)',
      {
        font: '8pt Arial',
        fill: '#FFFFFF',
        align: 'left'
      }
    );
    scene.colorBlindLabel.anchor.setTo(0, 0.5);
    scene.colorBlindLabel.visible = false;

    // Colorblind Status - shows current type
    scene.colorBlindStatus = scene.add.text(
      0.27 * WIDTH,
      0.678 * HEIGHT,
      this.colorBlindTypes[this.colorBlindMode],
      {
        font: 'bold 7pt Arial',
        fill: this.colorBlindMode > 0 ? '#FF4444' : '#666666',
        align: 'right'
      }
    );
    scene.colorBlindStatus.anchor.setTo(1, 0.5);
    scene.colorBlindStatus.visible = false;

    // === HIGH CONTRAST SECTION ===
    // High Contrast Toggle Box (simple rectangle)
    scene.contrastButton = scene.add.graphics(0, 0);
    scene.contrastButton.beginFill(this.highContrastMode ? 0xFF4444 : 0x000000, 0.8);
    scene.contrastButton.drawRoundedRect(0.04 * WIDTH, 0.73 * HEIGHT, 15, 15, 3);
    scene.contrastButton.endFill();
    scene.contrastButton.inputEnabled = true;
    scene.contrastButton.input.useHandCursor = true;
    scene.contrastButton.events.onInputDown.add(function() {
      ADAMenu.toggleHighContrast(scene);
    }, scene);
    scene.contrastButton.visible = false;

    // High Contrast Label
    scene.contrastLabel = scene.add.text(
      0.065 * WIDTH,
      0.738 * HEIGHT,
      'High Contrast (H)',
      {
        font: '8pt Arial',
        fill: '#FFFFFF',
        align: 'left'
      }
    );
    scene.contrastLabel.anchor.setTo(0, 0.5);
    scene.contrastLabel.visible = false;

    // High Contrast Status
    scene.contrastStatus = scene.add.text(
      0.27 * WIDTH,
      0.738 * HEIGHT,
      this.highContrastMode ? 'ON' : 'OFF',
      {
        font: 'bold 8pt Arial',
        fill: this.highContrastMode ? '#FF4444' : '#666666',
        align: 'right'
      }
    );
    scene.contrastStatus.anchor.setTo(1, 0.5);
    scene.contrastStatus.visible = false;

    // === CLOSE BUTTON ===
    // Create a simple clickable X close button
    scene.adaCloseButton = scene.add.graphics(0, 0);
    scene.adaCloseButton.beginFill(0xFF4444, 0.8);
    scene.adaCloseButton.drawCircle(0.27 * WIDTH, 0.57 * HEIGHT, 15);
    scene.adaCloseButton.endFill();
    scene.adaCloseButton.inputEnabled = true;
    scene.adaCloseButton.input.useHandCursor = true;
    scene.adaCloseButton.events.onInputDown.add(function() {
      ADAMenu.closeMenu(scene);
    }, scene);
    scene.adaCloseButton.visible = false;

    scene.adaCloseText = scene.add.text(
      0.27 * WIDTH,
      0.57 * HEIGHT,
      'X',
      {
        font: 'bold 10pt Arial',
        fill: '#FFFFFF',
        align: 'center'
      }
    );
    scene.adaCloseText.anchor.setTo(0.5, 0.5);
    scene.adaCloseText.visible = false;

    // === KEYBOARD SHORTCUTS ===
    // Add additional keyboard listeners
    scene.colorBlindKey = scene.input.keyboard.addKey(Phaser.Keyboard.C);
    scene.colorBlindKey.onDown.add(function() {
      ADAMenu.toggleColorBlind(scene);
    }, scene);

    scene.contrastKey = scene.input.keyboard.addKey(Phaser.Keyboard.H);
    scene.contrastKey.onDown.add(function() {
      ADAMenu.toggleHighContrast(scene);
    }, scene);
  },

  // Toggle the ADA menu
  toggleMenu: function() {
    var scene = this;
    ADAMenu.isOpen = !ADAMenu.isOpen;
    
    // Show/hide all menu elements
    var visible = ADAMenu.isOpen;
    scene.adaMenuBG.visible = visible;
    scene.adaMenuBorder.visible = visible;
    scene.adaMenuTitle.visible = visible;
    scene.ttsToggleButton.visible = visible;
    scene.ttsLabel.visible = visible;
    scene.ttsStatus.visible = visible;
    scene.colorBlindButton.visible = visible;
    scene.colorBlindLabel.visible = visible;
    scene.colorBlindStatus.visible = visible;
    scene.contrastButton.visible = visible;
    scene.contrastLabel.visible = visible;
    scene.contrastStatus.visible = visible;
    scene.adaCloseButton.visible = visible;
    scene.adaCloseText.visible = visible;

    // Play sound feedback
    if (AudioManager) {
      AudioManager.playSound("bloop_sfx", scene);
    }

    // Announce menu state
    if (visible && TTSManager.enabled) {
      TTSManager.speak("Accessibility menu opened. Use T for text to speech, C for colorblind support, H for high contrast");
    }
  },

  // Close the menu
  closeMenu: function(scene) {
    ADAMenu.isOpen = false;
    
    scene.adaMenuBG.visible = false;
    scene.adaMenuBorder.visible = false;
    scene.adaMenuTitle.visible = false;
    scene.ttsToggleButton.visible = false;
    scene.ttsLabel.visible = false;
    scene.ttsStatus.visible = false;
    scene.colorBlindButton.visible = false;
    scene.colorBlindLabel.visible = false;
    scene.colorBlindStatus.visible = false;
    scene.contrastButton.visible = false;
    scene.contrastLabel.visible = false;
    scene.contrastStatus.visible = false;
    scene.adaCloseButton.visible = false;
    scene.adaCloseText.visible = false;

    if (AudioManager) {
      AudioManager.playSound("bloop_sfx", scene);
    }

    if (TTSManager.enabled) {
      TTSManager.speak("Accessibility menu closed");
    }
  },

  // Toggle TTS and update UI
  toggleTTS: function(scene) {
    var wasEnabled = TTSManager.enabled;
    TTSManager.toggle();
    
    // Update toggle box color
    if (scene.ttsToggleButton) {
      scene.ttsToggleButton.clear();
      scene.ttsToggleButton.beginFill(TTSManager.enabled ? 0xFF4444 : 0x000000, 0.8);
      scene.ttsToggleButton.drawRoundedRect(0.04 * WIDTH, 0.61 * HEIGHT, 15, 15, 3);
      scene.ttsToggleButton.endFill();
    }

    // Update status text
    if (scene.ttsStatus) {
      scene.ttsStatus.setText(TTSManager.enabled ? 'ON' : 'OFF');
      scene.ttsStatus.fill = TTSManager.enabled ? '#FF4444' : '#666666';
    }

    // Play audio feedback
    if (AudioManager) {
      AudioManager.playSound("bloop_sfx", scene);
    }

    // Announce state change
    if (TTSManager.enabled && !wasEnabled) {
      TTSManager.speak("Text to speech enabled");
    } else if (!TTSManager.enabled && wasEnabled) {
      // Brief announcement before disabling
      setTimeout(() => {
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance("Text to speech disabled");
          utterance.rate = 0.8;
          speechSynthesis.speak(utterance);
        }
      }, 100);
    }
  },

  // Toggle Colorblind Support - cycles through different types
  toggleColorBlind: function(scene) {
    // Cycle through colorblind modes: Off -> Deuteranopia -> Protanopia -> Tritanopia -> Off
    this.colorBlindMode = (this.colorBlindMode + 1) % this.colorBlindTypes.length;
    
    // Update toggle box color
    if (scene.colorBlindButton) {
      scene.colorBlindButton.clear();
      scene.colorBlindButton.beginFill(this.colorBlindMode > 0 ? 0xFF4444 : 0x000000, 0.8);
      scene.colorBlindButton.drawRoundedRect(0.04 * WIDTH, 0.67 * HEIGHT, 15, 15, 3);
      scene.colorBlindButton.endFill();
    }

    // Update status text to show current type
    if (scene.colorBlindStatus) {
      scene.colorBlindStatus.setText(this.colorBlindTypes[this.colorBlindMode]);
      scene.colorBlindStatus.fill = this.colorBlindMode > 0 ? '#FF4444' : '#666666';
    }

    // Apply specific colorblind filters
    this.applyColorBlindFilter();

    // Play audio feedback
    if (AudioManager) {
      AudioManager.playSound("bloop_sfx", scene);
    }

    // Announce state change with specific type
    if (TTSManager.enabled) {
      var message = this.colorBlindMode === 0 ? 
        "Colorblind support disabled" : 
        "Colorblind support: " + this.colorBlindTypes[this.colorBlindMode];
      TTSManager.speak(message);
    }
  },

  // Apply specific color filters for different types of colorblindness
  applyColorBlindFilter: function() {
    var gameDiv = document.getElementById('gameDiv');
    if (!gameDiv) return;

    var filter = '';
    
    switch(this.colorBlindMode) {
      case 0: // Off
        filter = this.highContrastMode ? 'contrast(1.8) brightness(1.2)' : 'none';
        break;
        
      case 1: // Deuteranopia (red-green colorblindness - most common)
        // Enhance blue/yellow contrast, reduce red/green distinction
        filter = 'sepia(0.3) saturate(1.2) hue-rotate(10deg) contrast(1.1)';
        if (this.highContrastMode) {
          filter += ' contrast(1.8) brightness(1.2)';
        }
        break;
        
      case 2: // Protanopia (red-weak)
        // Shift reds toward yellow/orange, enhance blue contrast
        filter = 'sepia(0.2) saturate(1.3) hue-rotate(20deg) contrast(1.2)';
        if (this.highContrastMode) {
          filter += ' contrast(1.8) brightness(1.2)';
        }
        break;
        
      case 3: // Tritanopia (blue-yellow colorblindness - rare)
        // Enhance red/green contrast, adjust blue/yellow
        filter = 'sepia(0.1) saturate(1.4) hue-rotate(-10deg) contrast(1.1) brightness(1.1)';
        if (this.highContrastMode) {
          filter += ' contrast(1.8) brightness(1.2)';
        }
        break;
    }
    
    gameDiv.style.filter = filter;
    
    // Also apply complementary color adjustments to UI elements if needed
    this.adjustUIColors();
  },

  // Adjust UI element colors for better visibility with colorblind filters
  adjustUIColors: function() {
    var controlLegend = document.getElementById('controlLegend');
    if (controlLegend) {
      switch(this.colorBlindMode) {
        case 1: // Deuteranopia - enhance text contrast
          controlLegend.style.backgroundColor = 'rgba(59,57,57,0.9)';
          break;
        case 2: // Protanopia - slightly adjust background
          controlLegend.style.backgroundColor = 'rgba(59,57,57,0.95)';
          break;
        case 3: // Tritanopia - high contrast background
          controlLegend.style.backgroundColor = 'rgba(45,45,45,0.95)';
          break;
        default: // Off
          controlLegend.style.backgroundColor = 'rgb(59,57,57)';
          break;
      }
    }
  },

  // Toggle High Contrast
  toggleHighContrast: function(scene) {
    this.highContrastMode = !this.highContrastMode;
    
    // Update toggle box color
    if (scene.contrastButton) {
      scene.contrastButton.clear();
      scene.contrastButton.beginFill(this.highContrastMode ? 0xFF4444 : 0x000000, 0.8);
      scene.contrastButton.drawRoundedRect(0.04 * WIDTH, 0.73 * HEIGHT, 15, 15, 3);
      scene.contrastButton.endFill();
    }

    // Update status text
    if (scene.contrastStatus) {
      scene.contrastStatus.setText(this.highContrastMode ? 'ON' : 'OFF');
      scene.contrastStatus.fill = this.highContrastMode ? '#FF4444' : '#666666';
    }

    // Reapply filters combining high contrast with colorblind mode
    this.applyColorBlindFilter();

    // Play audio feedback
    if (AudioManager) {
      AudioManager.playSound("bloop_sfx", scene);
    }

    // Announce state change
    if (TTSManager.enabled) {
      TTSManager.speak(this.highContrastMode ? "High contrast enabled" : "High contrast disabled");
    }
  }
};

// Initialize TTS when the script loads
window.addEventListener('load', function() {
  TTSManager.init();
});

// Export for global access
window.TTSManager = TTSManager;
window.ADAMenu = ADAMenu;