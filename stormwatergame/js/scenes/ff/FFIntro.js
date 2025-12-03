"use strict";

var FFIntroState = {
  preload: function () { },
  create: function () {
    this.subSceneIndex = 0;

    // Background
    this.backgroundSprite = this.add.sprite(0, 0, "background_1");

    // Clouds
    this.cloudSprites = createCloudSprites(this);

    // Characters
    this.professorSprite1 = this.add.sprite(
      0.42 * WIDTH,
      0.4 * HEIGHT,
      "professor_5"
    );

    this.professorSprite2 = this.add.sprite(
      0.4 * WIDTH,
      0.39 * HEIGHT,
      "professor_6"
    );
    this.professorSprite2.visible = false;

    this.professorSprite3 = this.add.sprite(
      0.4 * WIDTH,
      0.39 * HEIGHT,
      "professor_4"
    );
    this.professorSprite3.visible = false;

    this.professorSprite4 = this.add.sprite(
      0.36 * WIDTH,
      0.42 * HEIGHT,
      "professor_2"
    );
    this.professorSprite4.visible = false;

    // Misc.
    this.houseSprite1 = this.add.sprite(
      0.045 * WIDTH,
      0.38 * HEIGHT,
      "ff_house_1"
    );
    this.houseSprite2 = this.add.sprite(
      0.67 * WIDTH,
      0.38 * HEIGHT,
      "ff_house_2"
    );

    // Speech Boxes
    this.speechBox1 = this.add.sprite(
      0.235 * WIDTH,
      0.345 * HEIGHT,
      "speechbox_1"
    );
    this.speechBox1.anchor.setTo(0.5, 0.5);
    scaleForTextSize(this.speechBox1, 1.0, 1.0);

    // Speech Text
    this.speechText1 = this.add.text(
      0.215 * WIDTH,
      0.345 * HEIGHT,
      TextData.ffIntro[0],
      TextStyle.centered
    );
    this.speechText1.anchor.setTo(0.5, 0.5);
    this.speechText1.lineSpacing = TextStyle.lineSpacing;
    this.speechText1.resolution = 2;

    this.speechText2 = this.add.text(
      0.215 * WIDTH,
      0.345 * HEIGHT,
      TextData.ffIntro[1],
      TextStyle.centered
    );
    this.speechText2.anchor.setTo(0.5, 0.5);
    this.speechText2.lineSpacing = TextStyle.lineSpacing;
    this.speechText2.visible = false;
    this.speechText2.resolution = 2;

    this.speechText3 = this.add.text(
      0.215 * WIDTH,
      0.345 * HEIGHT,
      TextData.ffIntro[2],
      TextStyle.centered
    );
    this.speechText3.anchor.setTo(0.5, 0.5);
    this.speechText3.lineSpacing = TextStyle.lineSpacing;
    this.speechText3.addFontWeight("bold", 52);
    this.speechText3.addFontWeight("normal", 61);
    this.speechText3.visible = false;
    this.speechText3.resolution = 2;

    this.speechText4 = this.add.text(
      0.215 * WIDTH,
      0.345 * HEIGHT,
      TextData.ffIntro[3],
      TextStyle.centered
    );
    this.speechText4.anchor.setTo(0.5, 0.5);
    this.speechText4.lineSpacing = TextStyle.lineSpacing;
    this.speechText4.visible = false;
    this.speechText4.resolution = 2;

    // Buttons
    this.nextButton = this.add.button(
      0.5 * WIDTH,
      0.2 * HEIGHT,
      "button_play",
      this.nextButtonActions.onClick,
      this,
      0,
      0,
      1
    );
    this.nextButton.anchor.setTo(0.5, 0.5);
    this.nextButton.visible = false;
    createAccessibleTween(this, this.nextButton.scale)
      .to({ x: 1.1, y: 1.1 }, 600, "Linear", true)
      .yoyo(true, 0)
      .loop(true);

    // Add spacebar support for next button
    this.spaceKey = this.input.keyboard.addKey(32);
    this.spaceKey.onDown.add(function() {
      if (!this.adaMenuBG || !this.adaMenuBG.visible) {
        if (this.nextButton && this.nextButton.visible) {
          this.nextButtonActions.onClick.call(this);
        }
      }
    }, this);

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
    // Mute button
    createMuteButton(this);

    // ADA menu button
    ADAMenu.createADAButton(this);

    // Start Animation
    this.nextDelay = 1000;
    this.animationSpeed = window.ADAReducedMotion ? 0 : 500;

    createAccessibleTween(this, this.speechText1.scale)
      .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);
    createAccessibleTween(this, this.speechBox1.scale)
      .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);
    this.time.events.add(
      this.nextDelay,
      function () {
        this.nextButton.visible = true;
      },
      this
    );

    // Speak first text
    TTSManager.speakGameText(TextData.ffIntro[0]);
  },
  update: function () {
    updateCloudSprites(this);
  },
  nextSubScene: function () {
    // This probably isn't the most efficient way of doing this

    // Before changing subscene
    switch (this.subSceneIndex) {
      case 0:
        this.professorSprite1.visible = false;
        this.speechText1.visible = false;

        this.nextButton.visible = false;
        break;
      case 1:
        this.professorSprite2.visible = false;
        this.speechText2.visible = false;

        this.nextButton.visible = false;
        break;
      case 2:
        this.professorSprite3.visible = false;
        this.speechText3.visible = false;

        this.nextButton.visible = false;
        break;
      case 3:
        this.professorSprite4.visible = false;
        this.speechText4.visible = false;

        this.nextButton.visible = false;
        break;
    }

    // Increment subscene
    this.subSceneIndex++;

    // After changing subscene
    switch (this.subSceneIndex) {
      case 1:
        this.professorSprite2.visible = true;
        this.speechText2.visible = true;

        createAccessibleTween(this, this.speechText2.scale)
          .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);
        createAccessibleTween(this, this.speechBox1.scale)
          .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);

        this.time.events.add(
          this.nextDelay,
          function () {
            this.nextButton.visible = true;
          },
          this
        );

        // Speak the text for this scene
        TTSManager.speakGameText(TextData.ffIntro[1]);
        break;
      case 2:
        this.professorSprite3.visible = true;
        this.speechText3.visible = true;

        createAccessibleTween(this, this.speechText3.scale)
          .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);
        createAccessibleTween(this, this.speechBox1.scale)
          .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);

        this.time.events.add(
          this.nextDelay,
          function () {
            this.nextButton.visible = true;
          },
          this
        );

        // Speak the text for this scene
        TTSManager.speakGameText(TextData.ffIntro[2]);
        break;
      case 3:
        this.professorSprite4.visible = true;
        this.speechText4.visible = true;

        createAccessibleTween(this, this.speechText4.scale)
          .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);
        createAccessibleTween(this, this.speechBox1.scale)
          .from({ x: 0.0, y: 0.0 }, this.animationSpeed, "Elastic", true);

        this.time.events.add(
          this.nextDelay,
          function () {
            this.nextButton.visible = true;
          },
          this
        );

        // Speak the text for this scene
        TTSManager.speakGameText(TextData.ffIntro[3]);
        break;
      case 4:
        // Stop any ongoing speech when leaving this scene
        TTSManager.stop();
        this.state.start("FFGameState");
        break;
    }
  },
  nextButtonActions: {
    onClick: function () {
      AudioManager.playSound("bloop_sfx", this);
      this.nextSubScene();
    },
  },
};
