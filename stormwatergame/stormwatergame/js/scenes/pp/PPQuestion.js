"use strict";

var PPQuestionState = {
  preload: function () {},
  create: function () {
    var level = PPGameData.levels[PPGame.levelId];
    var question = level[PPGame.questionId];
    var options = question.options;

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
      this.add
        .tween(optionButton.scale)
        .to({ x: 0.95, y: 0.95 }, 600, "Linear", true)
        .yoyo(true, 0)
        .loop(true);
    }

    // Play music
    AudioManager.playSong("pp_music", this);

    // --- TTS integration ---
    // Helper: extract a short label from an option for TTS
    const _shortLabelFromOption = (opt) => {
      try {
        // Prefer an explicit label/alt if present
        if (opt.label) return opt.label;
        // Prefer the resultUpperText as a short summary
        if (opt.resultUpperText) {
          // take first sentence or up to 10 words
          const txt = opt.resultUpperText.replace(/\n+/g, ' ').trim();
          const sentenceMatch = txt.match(/^(.*?\.|$)/);
          if (sentenceMatch && sentenceMatch[0].trim()) {
            const sentence = sentenceMatch[0].replace(/\.$/, '').trim();
            const words = sentence.split(/\s+/);
            return words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');
          }
          return txt.split(/\s+/).slice(0, 10).join(' ');
        }
        // Fallback: sanitize asset name (e.g., 'pp_1_1a' -> 'pp 1 1 a')
        if (opt.name) {
          let s = opt.name.replace(/[_-]+/g, ' ');
          // try to remove common prefixes like pp_ or ff_
          s = s.replace(/^pp\s+|^ff\s+|^ffimage\s+|^image\s+/i, '');
          return s;
        }
      } catch (e) {}
      return 'option';
    };

    this.getPPQuestionVisibleText = () => {
      const texts = [];
      try {
        // Provide a short instruction rather than an asset name
        texts.push('Choose an option');
        for (var i = 0; i < options.length; ++i) {
          const label = _shortLabelFromOption(options[i]);
          texts.push('Option ' + (i + 1) + ': ' + label);
        }
      } catch (e) {}
      return texts.join(' - ');
    };

    const registerTTS = () => {
      if (!window.TTSManager) return;
      window.TTSManager.setGatherTextFn(this.getPPQuestionVisibleText);
      if (window.TTSManager.isEnabled()) window.TTSManager.speakCurrentText();
      this._ttsToggleHandler = (e) => {
        if (e && e.detail && e.detail.enabled) window.TTSManager.speakCurrentText();
      };
      window.TTSManager.on && window.TTSManager.on('tts-toggle', this._ttsToggleHandler);
    };

    if (window.TTSManager) registerTTS();
    else window.addEventListener('tts-ready', registerTTS, { once: true });
    // --- end TTS integration ---
  },
  update: function () {},
};
