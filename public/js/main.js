function disableDraggingFor(element) {
	element.draggable = false;
	element.onmousedown = function(event) {
		event.preventDefault();
		return false;
	};
}

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
		'/js/Wave.js',
		'/js/Viewport.js',
		'/js/requestAnimationFrame.js',
		'/js/soundmanager2-nodebug-jsmin.js',
		'/js/Mangonel.js'
	];

	require(require_js, function(data) {

		Game = new Mangonel();

		/*
		* Socket.io
		*/

		Game.socket.on('connect', function() {
			Game.debugLog('Connected.');
			Game.start();
		});

		Game.socket.on('disconnect', function() {
			Game.debugLog('Disconnected.');
			Game.stop();
		});

		Game.socket.on('tot', function(data) {
			tot.html(data.tot);
			Game.debugLog("Current players number: "+ data.tot);
		});

	});

});