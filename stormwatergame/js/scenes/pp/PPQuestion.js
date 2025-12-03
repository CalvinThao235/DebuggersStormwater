"use strict";

var PPQuestionState = {
  preload: function () {},
  create: function () {
    var level = PPGameData.levels[PPGame.levelId];
    var question = level[PPGame.questionId];
    var options = question.options;
    
    // Initialize keyboard navigation arrays
    this.optionButtons = [];
    this.optionTweens = [];
    this.selectedOptionIndex = 0;

    // Randomize options
    if (PPGame.optionOrder.length == 0) {
      var randomOptions = [];
      for (var i = 0; i < options.length; ++i) {
        randomOptions.push({
          id: i,
          obj: options[i],
        });
      }
      shuffleArray(randomOptions);
      PPGame.optionOrder = randomOptions;
    }

    // Background
    this.backgroundSprite = this.add.sprite(0, 0, "background_2");

    // Question Text Sprite
    this.questionTextSprite = this.add.sprite(
      0.45 * WIDTH,
      0.1 * HEIGHT,
      "pp_question_text"
    );

    // Question Image Sprite
    this.questionImageSprite = this.add.sprite(0, 0, question.name);

    // Mute button
    createMuteButton(this);

    // ADA menu button
    ADAMenu.createADAButton(this);

    // Pause Button
    var onPause = function () {
      AudioManager.playSound("bloop_sfx", this);
      LastState = "PPQuestionState";
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

    // Choice Buttons
    var buttonWidth = WIDTH * (options.length == 3 ? 0.33 : 0.42);
    for (var i = 0; i < PPGame.optionOrder.length; ++i) {
      var onClick = function (ref) {
        PPGame.chosenOptionId = ref.optionIndex;
        PPGame.scoreLock = false;
        PPGame.optionOrder = [];
        AudioManager.playSound("bloop_sfx", this);
        this.state.start("PPRainState");
      };
      var xOffset =
        0.5 * WIDTH -
        buttonWidth * (PPGame.optionOrder.length - 1) * 0.5 +
        buttonWidth * i;
      var optionButton = this.add.button(
        xOffset,
        0.68 * HEIGHT,
        PPGame.optionOrder[i].obj.name,
        onClick,
        this,
        0,
        0,
        0
      );
      optionButton.anchor.setTo(0.5, 0.5);
      optionButton.optionIndex = PPGame.optionOrder[i].id;
      
      // Store buttons and tweens for keyboard navigation
      this.optionButtons.push(optionButton);
      // Store the tween so we can pause it later
      var buttonTween = createAccessibleTween(this, optionButton.scale)
        .to({ x: 0.95, y: 0.95 }, 600, "Linear", true)
        .yoyo(true, 0)
        .loop(true);
      this.optionTweens.push(buttonTween);
    }

    // Add keyboard support for arrow keys and spacebar
    this.leftKey = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.leftKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        if (this.optionButtons && this.optionButtons.length > 0) {
          this.selectedOptionIndex = (this.selectedOptionIndex - 1 + this.optionButtons.length) % this.optionButtons.length;
          this.updateOptionHighlight();
          if (window.ADATTSEnabled) {
            TTSManager.speak("Option " + (this.selectedOptionIndex + 1) + " of " + this.optionButtons.length);
          }
        }
      }
    }, this);
    
    this.rightKey = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    this.rightKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        if (this.optionButtons && this.optionButtons.length > 0) {
          this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.optionButtons.length;
          this.updateOptionHighlight();
          if (window.ADATTSEnabled) {
            TTSManager.speak("Option " + (this.selectedOptionIndex + 1) + " of " + this.optionButtons.length);
          }
        }
      }
    }, this);
    
    this.spaceKey = this.input.keyboard.addKey(32);
    this.spaceKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        if (this.optionButtons && this.optionButtons[this.selectedOptionIndex]) {
          var selectedButton = this.optionButtons[this.selectedOptionIndex];
          PPGame.chosenOptionId = selectedButton.optionIndex;
          PPGame.scoreLock = false;
          PPGame.optionOrder = [];
          AudioManager.playSound("bloop_sfx", this);
          this.state.start("PPRainState");
        }
      }
    }, this);

    // Play music
    AudioManager.playSong("pp_music", this);
    
    // Initialize highlight with a small delay to ensure tweens are started
    this.time.events.add(100, function() {
      this.updateOptionHighlight();
    }, this);

    // Speak question prompt with number of options
    var optionCount = this.optionButtons.length;
    TTSManager.speakGameText("Question. Look at the situation shown above. Choose the best option to protect our waterways. " + optionCount + " options available. Use arrow keys to navigate.", { delay: 500 });
  },
  update: function () {
    // Continuously apply highlight in update loop
    if (this.optionButtons && this.optionButtons[this.selectedOptionIndex]) {
      this.optionButtons[this.selectedOptionIndex].tint = 0x00FFFF;
    }
  },
  updateOptionHighlight: function () {
    // Reset all buttons
    for (var i = 0; i < this.optionButtons.length; i++) {
      this.optionButtons[i].tint = 0xFFFFFF;
    }
    
    // Apply cyan tint to selected button - update loop will maintain it
    if (this.optionButtons[this.selectedOptionIndex]) {
      this.optionButtons[this.selectedOptionIndex].tint = 0x00FFFF;
    }
  },
};
