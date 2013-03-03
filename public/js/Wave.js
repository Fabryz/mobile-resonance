(function(exports) {

    var Wave = function(options) {
        this.id        = options.id;
        this.playerId  = options.playerId || -1;

        this.x         = options.x || 0;
        this.y         = options.y || 0;
        this.radius    = options.radius || 10;

        this.color     = options.color || 'black';
        this.lineWidth = options.lineWidth || 1;

        this.isActive  =  true;

        return this.id;
    };

    Wave.prototype.toString = function() {
        return this.id       +' '+
               this.playerId +' '+
               this.x        +':'+
               this.y        +' '+
               this.radius   +' '+
               this.isActive;
    };

    /* Wave.prototype.setId = function(id) {
        this.id = id;
    };

    Wave.prototype.setPlayerId = function(playerId) {
        this.playerId = playerId;
    };

    Wave.prototype.setXY = function(x, y) {
        this.x = x;
        this.y = y;
    };

    Wave.prototype.setX = function(x) {
        this.x = x;
    };

    Wave.prototype.setY = function(y) {
        this.y = y;
    };

    Wave.prototype.setRadius = function(radius) {
        this.radius = radius;
    };

    Wave.prototype.setActive = function(isActive) {
        this.isActive = isActive;
    };*/

    Wave.prototype.grow = function(value) {
        this.radius += value;
    };

    Wave.prototype.shrink = function(value) {
        this.radius -= value;
    };

    Wave.prototype.getPoint = function(angle) {
        return { x: this.x + Math.cos(angle) * this.radius, y: this.y + Math.sin(angle) * this.radius };
    };

    // http://i.imgur.com/S1LfmpO.jpg recap
    Wave.prototype.getDiagonalBounds = function() {
        // NE SE SW NW / N E S W
        var diagonalBounds = [
            // (7/4 * Math.PI), // 315
            // (1/4 * Math.PI), // 45
            // (3/4 * Math.PI), // 135
            // (5/4 * Math.PI)  // 225
            (Math.PI * 3/2), // 270
            0,               // 0
            (Math.PI / 2),   // 90
            Math.PI          // 180
        ];

        for (var i in diagonalBounds) {
            diagonalBounds[i] = this.getPoint(diagonalBounds[i]);
        }

        return diagonalBounds;
    };

    Wave.prototype.draw = function(ctx) {
    var startAngle = 0,
        endAngle = Math.PI * 2;

     ctx.beginPath();
     ctx.arc(this.x, this.y, this.radius, startAngle, endAngle, false);

     ctx.lineWidth = this.lineWidth;
     ctx.strokeStyle = this.color;
     ctx.stroke();
 };

 exports.Wave = Wave;
})(typeof global === "undefined" ? window : exports);