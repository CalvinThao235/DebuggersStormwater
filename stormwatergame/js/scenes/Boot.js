"use strict";

var BootState = {
  init: function () {
    // Initialize global ADA accessibility variables
    if (typeof window.ADATextSizeMultiplier === 'undefined') {
      window.ADATextSizeMultiplier = 1.0;
    }
    if (typeof window.ADAReducedMotion === 'undefined') {
      window.ADAReducedMotion = false;
    }
    if (typeof window.ADAAudioCaptions === 'undefined') {
      window.ADAAudioCaptions = false;
    }

    if (this.game.device.desktop) {
      this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
      this.scale.setMinMax(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT);
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
    } else {
      this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
      this.scale.setMinMax(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT);
      this.scale.pageAlignHorizontally = true;
      this.scale.windowConstraints.bottom = "visual";
    }
  },
  preload: function () {
    this.load.image("background_1", "assets/background/1.png");
    this.load.image("progress_bar", "assets/progress_bar.png");
    this.load.image("progress_bar_bg", "assets/progress_bar_bg.png");
  },
  create: function () {
    this.state.start("LoadState");
  },
};
