/*
This is the Keyboard File that handles keyboard functionality for the website
*/
var GameKeyboard = {
    focused: 0, // Currently focused button index
    buttons: [], // Array to store buttons for the current screen
    box: null, // The visual indicator box for the focused button
    currentState: '', // The current game state
    
    start: function() {
        this.makeBox(); // Create the box to highlight the focused button
        this.keys(); // Set up the key event listeners
        this.check(); // Periodically check for state changes
    },
    
    makeBox: function() {
        // Create a box element to highlight the focused button
        this.box = document.createElement('div');
        this.box.style.cssText = 'position:absolute; border:3px solid yellow; display:none; pointer-events:none; z-index:999;';
        document.body.appendChild(this.box);
    },
    
    keys: function() {
        // Set up key event listeners for arrow keys and enter/space
        var self = this;
        document.onkeydown = function(e) {
            if (self.buttons.length === 0) return;
            
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
            // Enter or Space: Trigger button press action
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                self.press(); // Call the action for the currently focused button
            }
        };
    },
    
    check: function() {
        // Periodically check if the game state has changed, and update buttons
        var self = this;
        setInterval(function() {
            if (Game.state.current !== self.currentState) {
                self.currentState = Game.state.current; // Update the current state
                self.findButtons(); // Update the list of buttons for the new state
            }
        }, 500); // Check every 500ms
    },
    
    findButtons: function() {
        // Determine which buttons to display based on the current game state
        this.buttons = [];
        this.focused = 0;
        
        var state = Game.state.getCurrentState();
        if (!state) return;
        
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
        
        this.show(); // Update the display with the new buttons
    },
    
    show: function() {
        // Display the focused button highlight box
        if (this.buttons.length === 0) {
            this.box.style.display = 'none'; // Hide the box if no buttons exist
            return;
        }
        
        var buttonData = this.buttons[this.focused];
        var button = buttonData.btn;
        
        if (!button || !button.visible) {
            this.box.style.display = 'none'; // Hide if button is not visible
            return;
        }
        
        // Get the button bounds and adjust the box position
        var bounds = button.getBounds();
        var canvas = Game.canvas.getBoundingClientRect();
        
        this.box.style.display = 'block'; // Show the box
        this.box.style.left = (canvas.left + bounds.x - 3) + 'px';
        this.box.style.top = (canvas.top + bounds.y - 3) + 'px';
        this.box.style.width = (bounds.width + 6) + 'px';
        this.box.style.height = (bounds.height + 6) + 'px';
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
            // Pause button - handle inline function trigger
            else if (action === 'pause' && buttonData.btn.onInputDown) {
                buttonData.btn.onInputDown.dispatch(buttonData.btn);
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
