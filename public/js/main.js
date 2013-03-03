$(document).ready(function() {

	var Game = null,
		require_js = [],
		tot = $("#tot");

	/*
	* Main
	*/

	require_js = [
		'/socket.io/socket.io.js',
		'/js/Fps.js',
		'/js/Player.js',
		'/js/Viewport.js',
		'/js/requestAnimationFrame.js',
		'/js/Mangonel.js'
	];

	require(require_js, function(data) {

		Game = new Mangonel();

		/*
		* Socket.io
		*/

		Game.socket.on('connect', function() {
			Game.debug('Connected.');
			Game.start();
		});

		Game.socket.on('disconnect', function() {
			Game.debug('Disconnected.');
			Game.stop();
		});

		Game.socket.on('tot', function(data) {
			tot.html(data.tot);
			Game.debug("Current players number: "+ data.tot);
		});

	});

});