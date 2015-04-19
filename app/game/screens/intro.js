module.exports = {
	preload: function() {
		this.load.image('intro', 'assets/production/VDS_mainScreen.png');
		this.load.audio('bgm', '/assets/production/NocturneofHipster.mp3');
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
		this.scale.refresh()
	},
	create: function() {
		this.add.sprite(0, 0, 'intro');
		var stateText = this.add.text(this.world.centerX,this.world.centerY,' ', { font: '24px Arial', fill: '#fff' });
		stateText.anchor.setTo(0.5, 0.5);
		stateText.visible = true;
		stateText.text = "Space to start";
		stateText.align = 'center'
		var music = this.add.audio('bgm', 1, true);
		music.play();
	},
	update: function() {
		this.input.keyboard.onDownCallback = function(event) {

			if (this.game.state.getCurrentState().key == 'intro' && event.keyCode == 32 && event.repeat == false) {
				this.game.state.start('play');
			}
		}
	}
}
