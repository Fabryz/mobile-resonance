(function(exports) {

	soundManager.setup({
		url: '/swf/',
		autoLoad: true,
		autoPlay: false,
		flashVersion: 9,
		useFlashBlock: false,
		onready: function() {
			if (soundManager.supported()) {
				// SM2 is ready to go!
				soundManager.createSound({
					id: 'bounce',
					url: '/audio/bounce.ogg',
					autoLoad: true,
					autoPlay: false,
					volume: 50
				});
			} else {
				// unsupported/error case
				console.log('error');
			}
		}
	});

	var Mangonel = function() {
		var debug = true,
			desiredFPS = 60,
			allowSendEvery = 75,
			isReady = true,
			isPlaying = false,
			fps_handle = $('#fps'),
			debugPanel = $('#debug'),
			scoreboard = $("#scoreboard"),
			keys = {
				up : 38,
				down : 40,
				left : 37,
				right : 39,
				tab : 9,
				space : 32,
				enter : 13,
				w : 87,
				s : 83,
				a : 65,
				d : 68,
				backslash : 220
			};

		var last_wave_id = 0,
			waves = [];

		var player = new Player(),
			players = [];

		var fps = new Fps(2000),
			socket = new io.connect(window.location.href);

		var canvas = $('#canvas'),
			lobby = $('#lobby'),
			ctx = canvas.get(0).getContext("2d"),
			canvasWidth = canvas.width(),
			canvasHeight = canvas.height();

		var vp = new Viewport(canvasWidth, canvasHeight);

		var updateLobby = function() {
			lobby.attr({ width: $(window).innerWidth(), height: $(window).innerHeight() });
			var list = lobby.find('ul#players'),
				i = 0;

			list.html('');
			list.append("<li>"+ player.id +"</li>");
			for (i in players) {
				list.append("<li>"+ players[i].id +"</li>");
			}
		};

		var resizeCanvas = function() {
			canvasWidth = $(window).innerWidth();
			canvasHeight = $(window).innerHeight();

			canvas.attr({ width: canvasWidth, height: canvasHeight });

			ctx.fillStyle = 'rgb(0, 0, 0)';
			ctx.font = "15px Monospace";

			vp.setSize(canvasWidth, canvasHeight);
		};

		$(window).resize(resizeCanvas);
		resizeCanvas();

		var debugLog = function(msg) {
			console.log(new Date().toJSON() +": "+ msg);
		};

		var stop = function() {
			isPlaying = false;
			debugLog('* Mangonel stopped.');
		};

		var toggleDebugPanel = function(spd) {
			var speed = spd || 'fast';

			debugPanel.stop();
			debugPanel.fadeToggle(speed);
			debugPanel.toggleClass("active");
			if (debugPanel.hasClass("active")) {

			} else {

			}
		};

		var showScoreboard = function() {
			var list = scoreboard.find('ul');

			list.html('');
			var length = players.length;
			for(var i = 0; i < length; i++) {
				list.append("<li>"+ players[i] +"</li>");
			}

			list.append("<li>&nbsp;</li>");
			list.append("<li>Total players: "+ length +"</li>");
			scoreboard.show();
		};

		var start = function() {
			if (isReady) {
				debugLog('* Mangonel started.');
				isPlaying = true;

				$(window).keydown(function(e) {
					//e.preventDefault();

					switch(e.keyCode) {
						case keys.left:
								player.moveLeft = true;
							break;
						case keys.right:
								player.moveRight = true;
							break;
						case keys.up:
								player.moveUp = true;
							break;
						case keys.down:
								player.moveDown = true;
							break;

						case keys.tab:
								e.preventDefault();
								showScoreboard();
							break;

						default:
							break;
					}

				});

				$(window).keypress(function(e) {
					//e.preventDefault();
					var keyCode = e.keyCode;

				});

				$(window).keyup(function(e) {
					//e.preventDefault();

					switch(e.keyCode) {
						case keys.left:
								player.moveLeft = false;
							break;
						case keys.right:
								player.moveRight = false;
							break;
						case keys.up:
								player.moveUp = false;
							break;
						case keys.down:
								player.moveDown = false;
							break;

						case keys.backslash:
								toggleDebugPanel();
							break;
						case keys.tab:
								scoreboard.hide();
							break;

						default:
							break;
					}

				});

				fps.init(fps_handle);

				gameLoop();
			} else {
				debugLog('* Mangonel not ready.');
			}
		};

		// send a movement every allowSendEvery milliseconds
		var sendMovement = function() {
			var nowMove;

			if (player.hasMoved()) {
				var dir = 'idle';

				if (player.moveLeft) {
					dir = 'l';
				}
				if (player.moveRight) {
					dir = 'r';
				}
				if (player.moveUp) {
					dir = 'u';
				}
				if (player.moveDown) {
					dir = 'd';
				}

				player.lastMoveDir = dir;

				nowMove = Date.now();
				if ((nowMove - player.lastMoveTime) > allowSendEvery) {
					socket.emit('play', { id: player.id, dir: dir });
					player.lastMoveTime = Date.now();
				}
			}
		};

		// Convert map coordinates to viewport coordinates
		var mapToVp = function(x, y) {
			var vpCoords = vp.getCenter();

			return {
				x: x - vpCoords.x,
				y: y - vpCoords.y
			};
		};


		drawMapBounds = function() {
			var coords = mapToVp(0, 0);

			ctx.save();
			ctx.strokeStyle = "#AAA";
			ctx.lineWidth = 8;
			ctx.strokeRect(coords.x - 4, coords.y - 4, canvasWidth + 8, canvasHeight + 8);
			ctx.restore();
		};

		var drawPlayer = function(p) {
			var coords = mapToVp(p.x, p.y);

			ctx.save();

			ctx.translate(coords.x + (p.width / 2), coords.y + (p.height / 2));
			ctx.beginPath();

			switch(p.lastMoveDir) {
				case 'l':
						ctx.moveTo(0, 5);
						ctx.lineTo(0, -5);
						ctx.lineTo(-5, 0);
					break;
				case 'r':
						ctx.moveTo(0, 5);
						ctx.lineTo(0, -5);
						ctx.lineTo(5, 0);
					break;
				case 'u':
						ctx.moveTo(-5, 0);
						ctx.lineTo(5, 0);
						ctx.lineTo(0, -5);
					break;
				case 'd':
						ctx.moveTo(-5, 0);
						ctx.lineTo(5, 0);
						ctx.lineTo(0, 5);
					break;
			}

			ctx.closePath();
			ctx.fill();

			ctx.restore();

			//ctx.fillRect(coords.x, coords.y, p.width, p.height);
		};

		var isInsideCanvas = function(x, y) {
			return !((x < 0) ||
					(y < 0) ||
					(x > canvasWidth) ||
					(y > canvasHeight));
		};

		var checkWavesBounds = function() {
			var i = 0;
			for (i in waves) {
				// if (waves[i].isActive) {

					var diagonalBounds = waves[i].getDiagonalBounds(),
						j = 0;
					for (j in diagonalBounds) {

						// DEBUG
						ctx.beginPath();
						ctx.arc(diagonalBounds[j].x, diagonalBounds[j].y, 5, 0, Math.PI * 2, false);
						ctx.lineWidth = 3;
						ctx.strokeStyle = 'blue';
						ctx.stroke();

						if (!isInsideCanvas(diagonalBounds[j].x, diagonalBounds[j].y)) {
							soundManager.play('bounce');

							// waves[i].isActive = false;
							waves.splice(i, 1);

							break;
						}
					}

				// }

			}
		};

		var createWave = function(options) {
			options.id = last_wave_id;

			waves.push(new Wave(options));

			last_wave_id++;
		};

		$(canvas).bind("mousedown", function(e) {
            mouseX = e.offsetX || e.layerX;
            mouseY = e.offsetY || e.layerY;

            createWave({ playerId: player.id, x: mouseX, y: mouseY, radius: 10 });

            // console.log(mouseX, mouseY);
        });

		var drawWaves = function() {
			var i = 0;
			for (i in waves) {
				// if (waves[i]) {
				waves[i].draw(ctx);
				// }
			}
		};

		var growWaves = function() {
			var i = 0;
			for (i in waves) {
				// if (waves[i]) {
				waves[i].grow(1);
				// }
			}
		};

		var gameLoop = function() {
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);

			if (isPlaying) {
				/*sendMovement();

				vp.setCenter(player.x, player.y);

				drawMapBounds();
				drawPlayer(player);

				var length = players.length;
				for(var i = 0; i < length; i++) {
					if (players[i].id != player.id) {
						drawPlayer(players[i]);
					}
				}*/

				growWaves();
				checkWavesBounds();
				drawWaves();

				fps.count++;

				requestAnimationFrame(gameLoop);
				//setTimeout(gameLoop, desiredFPS); //debug
			}
		};

		socket.on('join', function(data) {
			player.id = data.player.id;
			player.nick = data.player.nick;
			player.x = data.player.x;
			player.y = data.player.y;

			debugLog('Received current player id: '+ player.id);
			debugLog('You have joined the server.');

			// waves = waves.filter(function(){return true;}); // cleans null from array FIXME

			updateLobby();
		});

		socket.on('quit', function(data) {
			var quitter = '';

			var length = players.length;
			for(var i = 0; i < length; i++) {
				if (players[i].id == data.id) {
					quitter = players[i].nick;
					players.splice(i, 1);
					break;
				}
			}

			debugLog('Player quitted: '+ quitter +' (id '+ data.id +')');
			updateLobby();
		});

		socket.on('newplayer', function(data) {
			var newPlayer = new Player();
			newPlayer.id = data.player.id;
			newPlayer.nick = data.player.nick;
			newPlayer.x = data.player.x;
			newPlayer.y = data.player.y;
			newPlayer.lastMoveDir = data.player.lastMoveDir;

			players.push(newPlayer);
			debugLog('New player joined: '+ newPlayer.nick);
			tmpPlayer = {};

			updateLobby();
		});

		socket.on('playerlist', function(data) {
			players = []; //prepare for new list

			var length = data.list.length;
			for(var i = 0; i < length; i++) {
				var tmpPlayer = new Player();
				tmpPlayer.id = data.list[i].id;
				tmpPlayer.nick = data.list[i].nick;
				tmpPlayer.x = data.list[i].x;
				tmpPlayer.y = data.list[i].y;
				tmpPlayer.lastMoveDir = data.list[i].lastMoveDir;
				tmpPlayer.ping = data.list[i].ping;

				players.push(tmpPlayer);
				tmpPlayer = {};
			}

			debugLog('Initial player list received: '+ length +' players.');
		});

		socket.on('play', function(data) {
			var length = players.length;
			for(var i = 0; i < length; i++) {
				if (players[i].id == data.id) {
					players[i].x = data.x;
					players[i].y = data.y;
					players[i].lastMoveDir = data.dir;
					if (player.id == data.id) {
						player.x = data.x;
						player.y = data.y;
						player.lastMoveDir = data.dir;
					}
				}
			}
		});

		socket.on('ping', function(data) {
			socket.emit('pong', { time: Date.now() });
			//debugLog('Ping? Pong!');
		});

		socket.on('pingupdate', function(data) {
			var length = players.length;
			for(var i = 0; i < length; i++) {
				if (players[i].id == data.id) {
					players[i].ping = data.ping;
					if (player.id == data.id) {
						player.ping = data.ping;
						$("#ping").html(player.ping +'ms');
					}
				}
			}
		});

		return {
			socket: socket,
			keys: keys,
			player: player,
			players: players,
			desiredFPS: desiredFPS,
			allowSendEvery: allowSendEvery,
			isReady: isReady,
			isPlaying: isPlaying,
			fps: fps,
			canvas: canvas,
			ctx: ctx,
			canvasWidth: canvasWidth,
			canvasHeight: canvasHeight,

			debugLog: debugLog,
			start: start,
			stop: stop,
			gameLoop: gameLoop,
			toggleDebugPanel: toggleDebugPanel
		};
	};

	exports.Mangonel = Mangonel;
})(typeof global === "undefined" ? window : exports);