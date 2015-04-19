var game = new Phaser.Game(400, 600, Phaser.AUTO)
var ctx = require('./play/gameContext')(game);

var play = function(game){} 
play.prototype = {
	preload: function() {
		require('./play/preload').bind(ctx)(this);
	},
	create: function() {
		require('./play/create').bind(ctx)(this);
	},
	update: function() {
		require('./play/update').bind(ctx)(this);
	}
};

var intro = function(game){}
var lose = function(game){}
var win = function(game){}
intro.prototype = require('./screens/intro');
lose.prototype = require('./screens/lose');
win.prototype = require('./screens/win');
game.state.add("intro", intro);
game.state.add("lose", lose);
game.state.add("win", win);
game.state.add("play", play);
game.state.start("intro");
