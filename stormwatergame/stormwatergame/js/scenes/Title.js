"use strict";

var TitleState = {
  preload: function () {},
  create: function () {
    // Background
    this.backgroundSprite = this.add.sprite(0, 0, "background_1");

    // Clouds
    this.cloudSprites = createCloudSprites(this);

    // Titles
    this.titleProfessorSprite = this.add.sprite(
      0.03 * WIDTH,
      0.05 * HEIGHT,
      "title_professor"
    );
    this.titlePreventsSprite = this.add.sprite(
      0.34 * WIDTH,
      0.1 * HEIGHT,
      "title_prevents"
    );

    // Accessibility: visible text objects for TTS to read (fallback for image titles)
    // These won't be styled on-screen (alpha 0) but provide accessible strings
    this._titleTextProfessor = this.add.text(0.03 * WIDTH, 0.05 * HEIGHT, "Professor", { font: "16px Arial", fill: "#000" });
    this._titleTextPrevents = this.add.text(0.34 * WIDTH, 0.1 * HEIGHT, "Prevents", { font: "16px Arial", fill: "#000" });
    // Keep them hidden visually but present for TTS
    this._titleTextProfessor.alpha = 0;
    this._titleTextPrevents.alpha = 0;

    // Characters
    this.professorSprite = this.add.sprite(
      0.03 * WIDTH,
      0.37 * HEIGHT,
      "professor_1"
    );

    // Buttons
    this.playButton = this.add.button(
      0.3 * WIDTH,
      0.68 * HEIGHT,
      "button_play",
      this.playButtonActions.onClick,
      this,
      0,
      0,
      1
    );
    this.playButton.anchor.setTo(0.5, 0.5);
    this.add
      .tween(this.playButton.scale)
      .to({ x: 1.1, y: 1.1 }, 600, "Linear", true)
      .yoyo(true, 0)
      .loop(true);

    // Mute button
    createMuteButton(this);

    // Audio
    AudioManager.playSong("title_music", this);
    
    // --- TTSManager integration ---
    // Helper to gather all visible text for this scene
    this.getAllVisibleText = () => {
      // Speak a short phrase describing the title screen
      const texts = [];
      // Use the hidden title text objects we created as the game name
      if (this._titleTextProfessor && this._titleTextProfessor.text)
        texts.push(this._titleTextProfessor.text);
      if (this._titleTextPrevents && this._titleTextPrevents.text)
        texts.push(this._titleTextPrevents.text);
      // Add a short instruction
      texts.push('Tap Play to begin');
      return texts.join(' - ');
    };

    // Register with TTSManager
    if (window.TTSManager) {
      window.TTSManager.setGatherTextFn(this.getAllVisibleText);
      // Speak immediately if TTS is enabled
      if (window.TTSManager.isEnabled()) {
        window.TTSManager.speakCurrentText();
      }
    }
    // --- End TTSManager integration ---
  },
  update: function () {
    updateCloudSprites(this);
  },
  playButtonActions: {
    onClick: function () {
      AudioManager.playSound("bloop_sfx", this);
      // Cancel any ongoing TTS when leaving the scene
      if (window.TTSManager) window.TTSManager.cancel();
      this.state.start("IntroState");
    },
  },
};
