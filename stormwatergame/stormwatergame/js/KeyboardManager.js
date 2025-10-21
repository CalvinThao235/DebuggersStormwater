/*
This is the Keyboard File that handles keyboard functionality for the website
*/
var GameKeyboard = {
    focused: 0, // Currently focused button index
    buttons: [], // Array to store buttons for the current screen
    glowGraphics: null, // Phaser graphics object for the glow effect
    currentState: '', // The current game state
    glowTween: null, // Animation tween for pulsing effect
    
    start: function() {
        this.makeGlow(); // Create the glow graphics object
        this.keys(); // Set up the key event listeners
        this.check(); // Periodically check for state changes
    },
    
    makeGlow: function() {
        // Create a Phaser graphics object for drawing the glow
        if (Game && Game.add) {
            this.glowGraphics = Game.add.graphics(0, 0);
            this.glowGraphics.alpha = 0.8;
        }
    },
    
    keys: function() {
        // Set up key event listeners for arrow keys and enter/space
        var self = this;
        document.onkeydown = function(e) {
            if (self.buttons.length === 0) return;
            
            // Check if we're in pause menu for grid navigation
            if (Game.state.current === 'PauseState') {
                self.handlePauseMenuNavigation(e);
            } else {
                // Normal linear navigation for other screens
                // Left/Up arrow: Focus previous button
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    self.focused = (self.focused - 1 + self.buttons.length) % self.buttons.length;
                    self.show(); // Update the display to reflect the new focused button
                }
                // Right/Down arrow: Focus next button
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    self.focused = (self.focused + 1) % self.buttons.length;
                    self.show(); // Update the display to reflect the new focused button
                }
            }
            
            // Enter or Space: Trigger button press action
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                self.press(); // Call the action for the currently focused button
            }
        };
    },
    
    handlePauseMenuNavigation: function(e) {
        // Grid-based navigation for pause menu
        // Layout: [Resume] [Restart]
        //         [Home]   [Mute]
        var currentButton = this.buttons[this.focused].action;
        var newFocus = this.focused;
        
        // Find button index by action
        var findButton = function(action) {
            for (var i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].action === action) return i;
            }
            return -1;
        }.bind(this);
        
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentButton === 'home') newFocus = findButton('resume');
            else if (currentButton === 'mute') newFocus = findButton('restart');
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentButton === 'resume') newFocus = findButton('home');
            else if (currentButton === 'restart') newFocus = findButton('mute');
        }
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentButton === 'restart') newFocus = findButton('resume');
            else if (currentButton === 'mute') newFocus = findButton('home');
        }
        else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentButton === 'resume') newFocus = findButton('restart');
            else if (currentButton === 'home') newFocus = findButton('mute');
        }
        
        if (newFocus !== -1) {
            this.focused = newFocus;
            this.show();
        }
    },
    
    check: function() {
        // Periodically check if the game state has changed, and update buttons
        var self = this;
        setInterval(function() {
            if (Game.state.current !== self.currentState) {
                self.currentState = Game.state.current; // Update the current state
                self.findButtons(); // Update the list of buttons for the new state
            }
            
            // Keep updating the glow position
            if (self.buttons.length > 0) {
                self.show();
            }
        }, 100); // Check every 100ms for smooth updates
    },
    
    findButtons: function() {
        // Determine which buttons to display based on the current game state
        this.buttons = [];
        this.focused = 0;
        
        var state = Game.state.getCurrentState();
        if (!state) return;
        
        // Recreate graphics if needed
        if (!this.glowGraphics || !this.glowGraphics.game) {
            this.makeGlow();
        }
        
        // Check if we're in FF game state
        if (Game.state.current === 'FFGameState') {
            // If question box is visible, show Fix It and It's OK buttons
            if (state.questionBoxGroup && state.questionBoxGroup.visible) {
                if (state.fixItButton) this.buttons.push({btn: state.fixItButton, action: 'ff-fixit'});
                if (state.itsOkButton) this.buttons.push({btn: state.itsOkButton, action: 'ff-itsok'});
            }
            // Otherwise show the clickable sprites in the game
            else if (state.optionSprites) {
                for (var i = 0; i < state.optionSprites.length; i++) {
                    var optionSprite = state.optionSprites[i];
                    if (optionSprite.enabled && optionSprite.clickable && optionSprite.clickable.visible) {
                        this.buttons.push({
                            btn: optionSprite.clickable, 
                            action: 'ff-option',
                            optionIndex: i
                        });
                    }
                }
            }
        } else {
            // Add buttons to the list based on the current state
            if (state.playButton) this.buttons.push({btn: state.playButton, action: 'play'});
            if (state.muteButton) this.buttons.push({btn: state.muteButton, action: 'mute'});
            if (state.ffButton) this.buttons.push({btn: state.ffButton, action: 'ff'});
            if (state.ppButton) this.buttons.push({btn: state.ppButton, action: 'pp'});
            if (state.nextButton) this.buttons.push({btn: state.nextButton, action: 'next'});
            if (state.homeButton) this.buttons.push({btn: state.homeButton, action: 'home'});
            if (state.replayButton) this.buttons.push({btn: state.replayButton, action: 'replay'});
            if (state.pauseButton) this.buttons.push({btn: state.pauseButton, action: 'pause'});
            if (state.level1Btn) this.buttons.push({btn: state.level1Btn, action: 'level1'});
            if (state.level2Btn) this.buttons.push({btn: state.level2Btn, action: 'level2'});
            if (state.level3Btn) this.buttons.push({btn: state.level3Btn, action: 'level3'});
            
            // Add pause menu buttons if applicable
            if (state.resumeButton) this.buttons.push({btn: state.resumeButton, action: 'resume'});
            if (state.restartButton) this.buttons.push({btn: state.restartButton, action: 'restart'});
        }
        
        this.show(); // Update the display with the new buttons
    },
    
    show: function() {
        // Display the focused button highlight glow
        if (!this.glowGraphics) return;
        
        this.glowGraphics.clear();
        
        if (this.buttons.length === 0) {
            return;
        }
        
        var buttonData = this.buttons[this.focused];
        var button = buttonData.btn;
        
        if (!button || !button.visible || !button.alive) {
            return;
        }
        
        // Draw glow effect matching button shape
        var bounds = button.getBounds();
        var centerX = bounds.x + bounds.width / 2;
        var centerY = bounds.y + bounds.height / 2;
        
        // Only use circles for actual round buttons (play, pause, home, replay, mute)
        // Check both the action name and look at actual texture/key name
        var circularButtons = ['play', 'pause', 'home', 'replay', 'mute', 'resume', 'restart'];
        var isCircular = circularButtons.indexOf(buttonData.action) !== -1;
        
        // For FF game sprites, use flexible outline that follows the sprite bounds
        var isFFOption = buttonData.action === 'ff-option';
        
        // Also check the texture key to identify circular buttons by their sprite name
        if (button.key && (button.key.indexOf('button_play') !== -1 || 
                           button.key.indexOf('button_pause') !== -1 ||
                           button.key.indexOf('button_home') !== -1 ||
                           button.key.indexOf('button_replay') !== -1 ||
                           button.key.indexOf('button_sound') !== -1)) {
            isCircular = true;
        }
        
        // Draw multiple layers for glow effect
        for (var i = 3; i >= 1; i--) {
            var offset = i * 8;
            var alpha = 0.3 / i;
            
            this.glowGraphics.lineStyle(4, 0xFFD700, alpha);
            
            if (isCircular) {
                // Draw circular glow for round buttons
                var radius = (bounds.width / 2) + offset;
                this.glowGraphics.drawCircle(centerX, centerY, radius * 2);
            } else if (isFFOption) {
                // Draw ellipse or flexible shape for FF game objects
                var radiusX = (bounds.width / 2) + offset;
                var radiusY = (bounds.height / 2) + offset;
                this.glowGraphics.drawEllipse(centerX, centerY, radiusX * 2, radiusY * 2);
            } else {
                // Draw rounded rectangle glow for square/rectangular buttons
                this.glowGraphics.drawRoundedRect(
                    bounds.x - offset,
                    bounds.y - offset,
                    bounds.width + (offset * 2),
                    bounds.height + (offset * 2),
                    15
                );
            }
        }
        
        // Draw inner bright outline
        this.glowGraphics.lineStyle(3, 0xFFD700, 0.9);
        if (isCircular) {
            this.glowGraphics.drawCircle(centerX, centerY, bounds.width + 6);
        } else if (isFFOption) {
            var radiusX = (bounds.width / 2) + 3;
            var radiusY = (bounds.height / 2) + 3;
            this.glowGraphics.drawEllipse(centerX, centerY, radiusX * 2, radiusY * 2);
        } else {
            this.glowGraphics.drawRoundedRect(
                bounds.x - 3,
                bounds.y - 3,
                bounds.width + 6,
                bounds.height + 6,
                12
            );
        }
        
        // Create pulsing animation if not already active
        if (!this.glowTween || !this.glowTween.isRunning) {
            this.glowTween = Game.add.tween(this.glowGraphics).to(
                { alpha: 0.5 },
                800,
                Phaser.Easing.Sinusoidal.InOut,
                true,
                0,
                -1,
                true
            );
        }
    },
    
    press: function() {
        // Trigger the action for the currently focused button
        if (this.buttons.length === 0) return;
        
        var buttonData = this.buttons[this.focused];
        var state = Game.state.getCurrentState();
        var action = buttonData.action;
        
        // Call the appropriate action for the button based on its type
        try {
            if (action === 'play' && state.playButtonActions) {
                state.playButtonActions.onClick.call(state);
            }
            else if (action === 'mute') {
                muteButtonActions.onClick.call(state);
            }
            else if (action === 'ff' && state.ffButtonActions) {
                state.ffButtonActions.onClick.call(state);
            }
            else if (action === 'pp' && state.ppButtonActions) {
                state.ppButtonActions.onClick.call(state);
            }
            else if (action === 'next' && state.nextButtonActions) {
                state.nextButtonActions.onClick.call(state);
            }
            else if (action === 'home' && state.homeButtonActions) {
                state.homeButtonActions.onClick.call(state);
            }
            else if (action === 'replay' && state.replayButtonActions) {
                state.replayButtonActions.onClick.call(state);
            }
            else if (action === 'level1' && state.buttonActions) {
                state.buttonActions.onClickOne.call(state);
            }
            else if (action === 'level2' && state.buttonActions) {
                state.buttonActions.onClickTwo.call(state);
            }
            else if (action === 'level3' && state.buttonActions) {
                state.buttonActions.onClickThree.call(state);
            }
            // Pause button - directly trigger pause state
            else if (action === 'pause') {
                // Directly trigger pause like the button does
                AudioManager.playSound('bloop_sfx', state);
                LastState = Game.state.current;
                Game.state.start('PauseState');
            }
            // Find It & Fix It game options
            else if (action === 'ff-option') {
                // Trigger the click event on the FF game sprite
                if (buttonData.btn.events && buttonData.btn.events.onInputDown) {
                    buttonData.btn.events.onInputDown.dispatch(buttonData.btn);
                }
            }
            // Handle pause menu buttons with specific actions
            else if (action === 'resume' && state.resumeButtonActions) {
                state.resumeButtonActions.onClick.call(state);
            }
            else if (action === 'restart' && state.restartButtonActions) {
                state.restartButtonActions.onClick.call(state);
            }
        } catch (e) {
            console.log('Button press failed:', action, e); // Log any errors
        }
    }
};

// Start the GameKeyboard setup after a 2-second delay
setTimeout(GameKeyboard.start.bind(GameKeyboard), 2000);