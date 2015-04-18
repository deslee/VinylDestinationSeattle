var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game_window', {
	preload: require('./preload'),
	create: require('./create'),
	update: require('./update')
});
