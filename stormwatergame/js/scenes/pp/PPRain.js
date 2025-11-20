"use strict";

var PPRainState = {
  preload: function () {},
  create: function () {
    // Background
    this.backgroundSprite1 = this.add.sprite(0, 0, "background_1");
    this.backgroundSprite2 = this.add.sprite(0, 0, "background_1_1");

    // Clouds
    this.cloudSprite1 = this.add.sprite(
      -0.18 * WIDTH,
      0.02 * HEIGHT,
      "cloud_3"
    );
    createAccessibleTween(this, this.cloudSprite1)
      .to({ x: -0.02 * WIDTH }, 2000, "Sine", true);

    this.cloudSprite2 = this.add.sprite(0.88 * WIDTH, 0.18 * HEIGHT, "cloud_4");
    createAccessibleTween(this, this.cloudSprite2)
      .to({ x: 0.7 * WIDTH }, 2000, "Sine", true);

    // Misc.
    this.houseSprite = this.add.sprite(0.08 * WIDTH, 0.45 * HEIGHT, "pp_house");

    // Rain - reduced particle count if reduced motion is enabled
    var particleCount = window.ADAReducedMotion ? 50 : 200;
    var emissionRate = window.ADAReducedMotion ? 20 : 5;
    this.rainEmitter = this.add.emitter(0.5 * WIDTH, -0.5 * HEIGHT, particleCount);
    this.rainEmitter.width = 1.5 * WIDTH;
    this.rainEmitter.angle = 20;
    this.rainEmitter.makeParticles("pp_raindrop");
    this.rainEmitter.minParticleScale = 0.8;
    this.rainEmitter.maxParticleScale = 1.0;
    this.rainEmitter.setYSpeed(300, 500);
    this.rainEmitter.setXSpeed(-5, 5);
    this.rainEmitter.minRotation = this.rainEmitter.maxRotation = 0;
    this.rainEmitter.start(false, 1600, emissionRate, 0);

    // Characters
    this.professorSprite1 = this.add.sprite(
      0.37 * WIDTH,
      0.4 * HEIGHT,
      "professor_2"
    );

    // Speech Boxes
    this.speechBox1 = this.add.sprite(
      0.8 * WIDTH,
      0.68 * HEIGHT,
      "speechbox_2"
    );
    this.speechBox1.anchor.setTo(0.44, 0.5);
    scaleForTextSize(this.speechBox1, -1.0, -1.0);

    // Speech Text
    this.speechText1 = this.add.text(
      0.8 * WIDTH,
      0.68 * HEIGHT,
      TextData.ppRain,
      TextStyle.centeredLarge
    );
    this.speechText1.anchor.setTo(0.5, 0.5);
    this.speechText1.lineSpacing = TextStyle.lineSpacing;
    this.speechText1.resolution = 2;

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
    this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.spaceKey.onDown.add(function() {
      if (this.nextButton && this.nextButton.visible) {
        this.nextButton.onInputDown.dispatch();
      }
    }, this);

    // Mute button
    createMuteButton(this);

    // ADA menu button
    ADAMenu.createADAButton(this);

    // Pause Button
    var onPause = function () {
      AudioManager.playSound("bloop_sfx", this);
      LastState = "PPRainState";
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

    // Play sound
    AudioManager.playSound("rain_sfx", this);

    // Speak the rain text
    TTSManager.speakGameText(TextData.ppRain);
  },
  update: function () {},
  nextButtonActions: {
    onClick: function () {
      AudioManager.playSound("bloop_sfx", this);
      this.state.start("PPResultState");
    },
  },
};
