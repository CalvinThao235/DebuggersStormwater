"use strict";

var PPLevelSelectState = {
  preload: function () { },
  create: function () {
    // Set Restart Point
    RestartState = "PPLevelSelectState";

    // Background
    this.backgroundSprite = this.add.sprite(0, 0, "background_1");

    // Clouds
    this.cloudSprites = createCloudSprites(this);

    // Mute Button
    //this.muteBtn = this.add.button(0.9 * WIDTH, 0.1 * HEIGHT, "button_sound")

    // Characters
    this.professorSprite = this.add.sprite(
      0.12 * WIDTH,
      0.375 * HEIGHT,
      "professor_6"
    );

    // Title
    //this.title = this.add.sprite((0.5 * WIDTH) -

    // Speech Boxes
    this.speechBox = this.add.sprite(
      0.49 * WIDTH,
      0.35 * HEIGHT,
      "speechbox_3"
    );
    this.speechBox.anchor.setTo(0.44, 0.5);
    scaleForTextSize(this.speechBox, -1, -1);

    // Speech Text
    this.speechText = this.add.text(
      0.49 * WIDTH + 0.5,
      0.35 * HEIGHT + 0.5,
      TextData.ppChoseLevel,
      TextStyle.centeredExtraLarge
    );
    this.speechText.anchor.setTo(0.5, 0.5);
    this.speechText.lineSpacing = TextStyle.lineSpacing;
    this.speechText.resolution = 2;

    // Level Select Buttons
    this.level1Btn = this.add.button(
      0.475 * WIDTH,
      0.55 * HEIGHT,
      "button_pp_lvl1",
      this.buttonActions.onClickOne,
      this,
      0,
      0,
      1
    );
    this.level1Btn.anchor.setTo(0.5, 0.5);
    
    // Store level buttons and tweens for keyboard navigation
    this.levelButtons = [];
    this.levelTweens = [];
    this.selectedLevelIndex = 0;
    
    this.levelButtons.push(this.level1Btn);
    var level1Tween = createAccessibleTween(this, this.level1Btn.scale)
      .to({ x: 0.9, y: 0.9 }, 600, "Linear", true)
      .yoyo(true, 0)
      .loop(true);
    this.levelTweens.push(level1Tween);

    this.level2Btn = this.add.button(
      0.655 * WIDTH,
      0.55 * HEIGHT,
      "button_pp_lvl2",
      this.buttonActions.onClickTwo,
      this,
      0,
      0,
      1
    );
    this.level2Btn.anchor.setTo(0.5, 0.5);
    this.levelButtons.push(this.level2Btn);
    var level2Tween = createAccessibleTween(this, this.level2Btn.scale)
      .to({ x: 0.9, y: 0.9 }, 600, "Linear", true)
      .yoyo(true, 0)
      .loop(true);
    this.levelTweens.push(level2Tween);

    this.level3Btn = this.add.button(
      0.835 * WIDTH,
      0.55 * HEIGHT,
      "button_pp_lvl3",
      this.buttonActions.onClickThree,
      this,
      0,
      0,
      1
    );
    this.level3Btn.anchor.setTo(0.5, 0.5);
    this.levelButtons.push(this.level3Btn);
    var level3Tween = createAccessibleTween(this, this.level3Btn.scale)
      .to({ x: 0.9, y: 0.9 }, 600, "Linear", true)
      .yoyo(true, 0)
      .loop(true);
    this.levelTweens.push(level3Tween);

    // Pause Button
    var onPause = function () {
      AudioManager.playSound("bloop_sfx", this);
      LastState = "PPLevelSelectState";
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
    
    // Mute button
    createMuteButton(this);

    // ADA menu button
    ADAMenu.createADAButton(this);
    
    // Keyboard Navigation Setup
    this.leftKey = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    this.upKey = this.input.keyboard.addKey(Phaser.Keyboard.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    this.spaceKey = this.input.keyboard.addKey(32);
    
    this.leftKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        this.selectedLevelIndex = (this.selectedLevelIndex - 1 + 3) % 3;
        this.updateLevelHighlight();
      }
    }, this);
    
    this.rightKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        this.selectedLevelIndex = (this.selectedLevelIndex + 1) % 3;
        this.updateLevelHighlight();
      }
    }, this);
    
    this.upKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        this.selectedLevelIndex = (this.selectedLevelIndex - 1 + 3) % 3;
        this.updateLevelHighlight();
      }
    }, this);
    
    this.downKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        this.selectedLevelIndex = (this.selectedLevelIndex + 1) % 3;
        this.updateLevelHighlight();
      }
    }, this);
    
    this.spaceKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        if (this.selectedLevelIndex === 0) {
          this.buttonActions.onClickOne.call(this);
        } else if (this.selectedLevelIndex === 1) {
          this.buttonActions.onClickTwo.call(this);
        } else {
          this.buttonActions.onClickThree.call(this);
        }
      }
    }, this);
    
    // Initialize highlight
    this.updateLevelHighlight();

    // Speak the level select text
    TTSManager.speakGameText(TextData.ppChoseLevel);

    // Start Animation
    this.animationSpeed = 500;

    this.add
      .tween(this.speechText.scale)
      .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);
    this.add
      .tween(this.speechBox.scale)
      .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);

    // Audio (if reset)
    AudioManager.playSong("title_music", this);
  },
  update: function () {
    updateCloudSprites(this);
    
    // Continuously apply highlight to selected level button
    if (this.levelButtons && this.levelButtons[this.selectedLevelIndex]) {
      this.levelButtons[this.selectedLevelIndex].tint = 0x00FFFF;
    }
  },
  buttonActions: {
    onClickOne: function () {
      PPGame.levelId = 0;
      AudioManager.playSound("bloop_sfx", this);
      this.state.start("PPQuestionState");
    },
    onClickTwo: function () {
      PPGame.levelId = 1;
      AudioManager.playSound("bloop_sfx", this);
      this.state.start("PPQuestionState");
    },
    onClickThree: function () {
      PPGame.levelId = 2;
      AudioManager.playSound("bloop_sfx", this);
      this.state.start("PPQuestionState");
    },
  },
  updateLevelHighlight: function () {
    // Reset all level buttons to white
    for (var i = 0; i < this.levelButtons.length; i++) {
      this.levelButtons[i].tint = 0xFFFFFF;
    }
    
    // Apply cyan tint to selected button - update loop will maintain it
    if (this.levelButtons[this.selectedLevelIndex]) {
      this.levelButtons[this.selectedLevelIndex].tint = 0x00FFFF;
    }
  },
};
