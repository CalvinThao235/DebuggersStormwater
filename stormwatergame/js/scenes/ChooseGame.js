"use strict";
var LastState = "ChooseGameState";
var ChooseGameState = {
  preload: function () { },
  create: function () {
    // Background
    this.backgroundSprite = this.add.sprite(0, 0, "background_1");

    // Clouds
    this.cloudSprites = createCloudSprites(this);
    
    // Keyboard navigation state
    this.selectedGameIndex = 0; // 0 = FF, 1 = PP

    // Characters
    this.professorSprite1 = this.add.sprite(
      0.37 * WIDTH,
      0.41 * HEIGHT,
      "professor_2"
    );

    // Speech Boxes
    this.speechBox1 = this.add.sprite(
      0.2 * WIDTH,
      0.66 * HEIGHT,
      "speechbox_3"
    );
    this.speechBox1.anchor.setTo(0.44, 0.5);
    scaleForTextSize(this.speechBox1, 1.0, 1.0);

    // Speech Text
    this.speechText1 = this.add.text(
      0.2 * WIDTH + 0.5,
      0.66 * HEIGHT + 0.5,
      TextData.chooseGame,
      TextStyle.centered
    );
    this.speechText1.anchor.setTo(0.5, 0.5);
    this.speechText1.lineSpacing = TextStyle.lineSpacing;
    this.speechText1.resolution = 2;

    // Buttons
    this.ffButton = this.add.button(
      0.25 * WIDTH,
      0.22 * HEIGHT,
      "button_ff",
      this.ffButtonActions.onClick,
      this,
      0,
      0,
      1
    );
    this.ffButton.anchor.setTo(0.5, 0.5);
    createAccessibleTween(this, this.ffButton.scale)
      .to({ x: 0.9, y: 0.9 }, 600, "Linear", true)
      .yoyo(true, 0)
      .loop(true);

    this.ppButton = this.add.button(
      0.75 * WIDTH,
      0.22 * HEIGHT,
      "button_pp",
      this.ppButtonActions.onClick,
      this,
      0,
      0,
      1
    );
    this.ppButton.anchor.setTo(0.5, 0.5);
    createAccessibleTween(this, this.ppButton.scale)
      .to({ x: 0.9, y: 0.9 }, 600, "Linear", true)
      .yoyo(true, 0)
      .loop(true);

    // Mute button
    createMuteButton(this);

    // ADA menu button
    ADAMenu.createADAButton(this);

    // Speak the choose game text
    TTSManager.speakGameText(TextData.chooseGame);

    // Pause Button
    var onPause = function () {
      AudioManager.playSound("bloop_sfx", this);
      LastState = "ChooseGameState";
      this.state.start("PauseState");
    };
    this.pauseButton = this.add.button(
      0.892 * WIDTH,
      0.185 * HEIGHT,
      "button_pause",
      onPause,
      this,
      0,
      0,
      1
    );
    this.pauseButton.scale.setTo(0.75);

    // Keyboard Navigation Setup
    this.leftKey = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    this.upKey = this.input.keyboard.addKey(Phaser.Keyboard.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    this.spaceKey = this.input.keyboard.addKey(32);
    
    this.leftKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        this.selectedGameIndex = 0;
        this.updateGameHighlight();
      }
    }, this);
    
    this.rightKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        this.selectedGameIndex = 1;
        this.updateGameHighlight();
      }
    }, this);
    
    this.upKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        this.selectedGameIndex = 0;
        this.updateGameHighlight();
      }
    }, this);
    
    this.downKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        this.selectedGameIndex = 1;
        this.updateGameHighlight();
      }
    }, this);
    
    this.spaceKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        if (this.selectedGameIndex === 0) {
          this.ffButtonActions.onClick.call(this);
        } else {
          this.ppButtonActions.onClick.call(this);
        }
      }
    }, this);
    
    // Initialize highlight
    this.updateGameHighlight();

    // Start Animation
    this.animationSpeed = 500;

    this.add
      .tween(this.speechText1.scale)
      .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);
    this.add
      .tween(this.speechBox1.scale)
      .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);

    // Audio
    AudioManager.playSong("title_music", this);
  },
  update: function () {
    updateCloudSprites(this);
  },
  ffButtonActions: {
    onClick: function () {
      AudioManager.playSound("bloop_sfx", this);
      this.state.start("FFIntroState");
    },
  },
  ppButtonActions: {
    onClick: function () {
      AudioManager.playSound("bloop_sfx", this);
      this.state.start("PPIntroState");
    },
  },
  updateGameHighlight: function () {
    // Reset both buttons
    this.ffButton.tint = 0xFFFFFF;
    this.ppButton.tint = 0xFFFFFF;
    
    // Highlight selected button with bright cyan
    if (this.selectedGameIndex === 0) {
      this.ffButton.tint = 0x00FFFF;
    } else {
      this.ppButton.tint = 0x00FFFF;
    }
  },
};
