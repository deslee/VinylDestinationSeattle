module.exports = {
	preload: function() {
		var stateText = this.add.text(this.world.centerX,this.world.centerY,' ', { font: '24px Arial', fill: '#fff' });
		stateText.anchor.setTo(0.5, 0.5);
		stateText.visible = true;
		stateText.text = "You Win.\nPress space to play again";
		stateText.align = 'center'
	},
	create: function() {
	},
	update: function() {
		this.input.keyboard.onDownCallback = function(event) {
			if (this.game.state.getCurrentState().key == 'win' && event.keyCode == 32 && event.repeat == false) {
				this.game.state.start('play');
			}
		}
	}
}
