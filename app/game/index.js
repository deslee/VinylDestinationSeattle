var ctx;
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game_window', {
	preload: function() {
		ctx = require('./gameContext')(this);
		require('./preload').bind(ctx)(this);
	},
	create: function() {
		require('./create').bind(ctx)(this);
	},
	update: function() {
		require('./update').bind(ctx)(this);
	}
});
